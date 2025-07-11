// backend/server.js
// This code is validated and correct.

// --- 0. IMPORT TOOLS ---
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

dotenv.config();

// --- 1. INITIALIZE APP & SERVER ---
const app = express();
const server = http.createServer(app);

// --- 2. CONNECT TO DATABASE ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- 3. SET UP MIDDLEWARES ---
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(passport.initialize());

// --- 4. SOCKET.IO (REAL-TIME) SETUP ---
const io = new Server(server, { cors: { origin: process.env.CLIENT_URL } });
app.use((req, res, next) => {
  req.io = io;
  next();
});
io.on('connection', (socket) => console.log('🔌 A user connected via WebSocket'));

// --- 5. DATABASE "BLUEPRINTS" (SCHEMAS) ---
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    password: { type: String },
    googleId: { type: String },
    image: { type: String },
}, { timestamps: true });
const User = mongoose.model('User', UserSchema);

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ['todo', 'inprogress', 'done'], default: 'todo' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
const Task = mongoose.model('Task', TaskSchema);

// --- 6. AUTHENTICATION LOGIC ---
const callbackURL = process.env.NODE_ENV === 'production'
  ? `${process.env.RENDER_EXTERNAL_URL}/api/auth/google/callback`
  : `http://localhost:${process.env.PORT || 5000}/api/auth/google/callback`;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
  },
  async (accessToken, refreshToken, profile, done) => {
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      image: profile.photos[0].value
    };
    try {
      let user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        user.image = profile.photos[0].value;
        await user.save();
        done(null, user);
      } else {
        user = await User.create(newUser);
        done(null, user);
      }
    } catch (err) { done(err, null); }
  }
));

const authMiddleware = (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).json({ msg: 'No token, authorization denied' });
    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (e) { res.status(400).json({ msg: 'Token is not valid' }); }
};

// --- 7. API ROUTES ---
const authRouter = express.Router();
const tasksRouter = express.Router();

// AUTH: Register
authRouter.post('/register', async (req, res) => {
    const { displayName, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User with this email already exists' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const defaultImage = `https://api.dicebear.com/7.x/initials/svg?seed=${displayName.replace(' ','+')}`;
        user = new User({ displayName, email, password: hashedPassword, image: defaultImage });
        await user.save();
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// AUTH: Login
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) return res.status(400).json({ msg: 'Invalid credentials or please use Google Login' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// AUTH: Google
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.redirect(`${process.env.CLIENT_URL}/login/success?token=${token}`);
  })(req, res, next);
});

// USER: Get Me
app.get('/api/user/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -googleId');
        res.json(user);
    } catch(err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// TASKS: Get All
tasksRouter.get('/', authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch(err) { console.error(err.message); res.status(500).send("Server Error"); }
});

// TASKS: Create
tasksRouter.post('/', authMiddleware, async (req, res) => {
    try {
        if (!req.body.title) return res.status(400).json({msg: 'Title is required'});
        const newTask = new Task({ title: req.body.title, owner: req.user.id });
        await newTask.save();
        req.io.emit('tasks_updated');
        res.status(201).json(newTask);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// TASKS: Update (PUT)
tasksRouter.put('/:id', authMiddleware, async (req, res) => {
    try {
        let task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.owner.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        const { title, status } = req.body;
        if (title) task.title = title;
        if (status) task.status = status;

        await task.save();

        req.io.emit('tasks_updated');
        res.json(task);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// TASKS: Delete
tasksRouter.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ msg: 'Task not found' });
        if (task.owner.toString() !== req.user.id) return res.status(401).json({ msg: 'User not authorized' });
        await Task.findByIdAndDelete(req.params.id);
        req.io.emit('tasks_updated');
        res.json({ msg: 'Task removed' });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
});

// Use the routers
app.use('/api/auth', authRouter);
app.use('/api/tasks', tasksRouter);

// --- 8. START SERVER ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend server is flying on port ${PORT}`));