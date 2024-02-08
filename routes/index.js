var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer');
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', (req, res, next)=> {
  res.render('index', {nav: false});
});
router.get('/register', (req, res, next)=> {
  res.render('register', {nav: false});
});
router.get('/profile', isLoggedin, async(req, res, next)=> {
  const userData = await userModel
                  .findOne({username: req.session.passport.user})
                  .populate("posts");

  res.render('profile', {userData, nav: true});
});
router.get('/show/posts', isLoggedin, async(req, res, next)=> {
  const userData = await userModel
                  .findOne({username: req.session.passport.user})
                  .populate("posts");

  res.render('show', {userData, nav: true});
});
router.get('/feed', isLoggedin, async(req, res, next)=> {
  const userData = await userModel
                  .findOne({username: req.session.passport.user})
                  .populate("posts");
  const postData = await postModel
                   .find().populate('user')

  res.render('feed', {userData, postData, nav: true});
});
router.get('/add', isLoggedin, async(req, res, next)=> {
  const userData = await userModel.findOne({username: req.session.passport.user});
  res.render('add', {userData, nav: true});
});
router.post('/createpost', upload.single("postimage"), isLoggedin, async(req, res, next)=> {
  const userData = await userModel.findOne({username: req.session.passport.user});
  const postData = await postModel.create({
    user: userData._id,
    title: req.body.title,
    description: req.body.description,
    image: req.file.filename,
  });

  userData.posts.push(postData._id);
  await userData.save();
  res.redirect('/profile');
});

router.post('/register', (req, res, next)=> {
  const {username, email, contact, name} = req.body;
  const userData = new userModel({
    username: username,
    email: email,
    contact: contact,
    name: name
  });

  userModel.register(userData, req.body.password)
  .then(() => {
    passport.authenticate('local')(req, res, () => {
      res.redirect('/')
    })
  })
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/',
  failureFlash: true
}), (req, res) => {});

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if(err) return next(err);
    res.redirect('/');
  })
});

function isLoggedin(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect('/');
};

router.post('/fileupload', isLoggedin, upload.single("image"), async(req, res) => {
  // res.send("Uploaded")
  const userData = await userModel.findOne({username: req.session.passport.user});
  userData.profileImage = req.file.filename;
  await userData.save();
  res.redirect('/profile');
})

module.exports = router;