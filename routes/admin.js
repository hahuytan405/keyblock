const path = require('path');

const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/admin',isAuth, adminController.getAdmin);

router.get('/projects',isAuth, adminController.getProjects);

router.get('/add-project', isAuth, adminController.getAddProject);

router.post(
    '/add-project',
    [
      body('name').isString().isLength({ min: 1 }).trim(),
      body('title').isString().isLength({ min: 3 }).trim(),
      body('description').isString().isLength({ min: 5, max: 400 }).trim(),
    ],
    isAuth,
    adminController.postAddProject
  );

router.get(
    '/edit-project/:projectId',
    isAuth,
    adminController.getEditProject
  );

router.post(
  '/edit-project',
  [
    body('name').isString().isLength({ min: 1 }).trim(),
    body('title').isString().isLength({ min: 3 }).trim(),
    body('description').isString().isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProject
);

router.post(
  '/delete-project',
  isAuth,
  adminController.deleteProject
);

router.get('/reviews',isAuth, adminController.getReviews);

router.get('/add-review', isAuth, adminController.getAddReview);

router.post(
    '/add-review',
    [
      body('name').isString().isLength({ min: 1 }).trim(),
      body('address').isString().isLength({ min: 5 }).trim(),
      body('rating').isInt({ min: 0 }),
      body('comment').isString().isLength({ min: 5, max: 400 }).trim(),
    ],
    isAuth,
    adminController.postAddReview
  );

router.get(
    '/edit-review/:reviewId',
    isAuth,
    adminController.getEditReview
  );

router.post(
  '/edit-review',
  [
    body('name').isString().isLength({ min: 1 }).trim(),
    body('address').isString().isLength({ min: 5 }).trim(),
    body('rating').isInt({ min: 0 }),
    body('comment').isString().isLength({ min: 5, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditReview
);

router.post(
  '/delete-review',
  isAuth,
  adminController.deleteReview
);


module.exports = router;