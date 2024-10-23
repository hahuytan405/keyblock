const Project = require('../models/project');
const Review = require('../models/review');

const nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'hahuynhim2003@gmail.com',
    pass: 'ctaengknsxxvnkch',
  },
});

exports.getIndex = (req, res, next) => {
    Project.find().then(project => {
        Review.find().then(review => {
          res.render('index', {
            pageTitle: 'KeyBlock',
            projects: project,
            reviews: review,
          });
        });
      });
};

exports.postSubcribe = (req, res, next) => {
  const subE = req.body.subEmail
  if (!subE) {
    res.status(200).json({ message: 'Please enter a valid email address!' });
  } else {
    transporter.sendMail({
      from: 'hahuynhim2003@gmail.com',
      to: subE,
      subject: 'KeyBlock - Subscribe',
      text: 'You have successfully subscribed to our newsletter!',
    }).then(result => {
      console.log('Complete send email subscribe ');
      res.status(200).json({ message: 'Subscribed successfully!' });
    })
    .catch(err => {
      console.log(err);
    });
  }
}
