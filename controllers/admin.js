const Project = require('../models/project');
const Review = require('../models/review');
const path = require('path');
const fs = require('fs');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { google } = require('googleapis');
const KEYFILEPATH = path.join(__dirname, 'ServiceAcccoutCred.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});
const drive = google.drive({ version: 'v3', auth });

exports.getAdmin = (req, res, next) => {
  res.render('admin', {
    pageTitle: 'Admin manager',
  });
};

exports.getProjects = (req, res, next) => {
    const PROJECT_PER_PAGE = 1;
    const page = +req.query.page || 1;
    let totalProjects;

    Project.find()
        .countDocuments()
        .then(numProjects => {
        totalProjects = numProjects;
        return Project.find()
            .skip((page - 1) * PROJECT_PER_PAGE)
            .limit(PROJECT_PER_PAGE);
        })
        .then(projects => {
        res.render('projects', {
            pageTitle: 'Projects',
            projs: projects,
            currentPage: page,
            itemPerPage: PROJECT_PER_PAGE,
            totalProjects: totalProjects,
            hasNextPage: PROJECT_PER_PAGE * page < totalProjects,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(totalProjects / PROJECT_PER_PAGE),
        });
        })
        .catch(err => {
        console.log(err);
        });
};

exports.getAddProject = (req, res, next) => {
    res.render('edit-project', {
        pageTitle: 'Admin maneger',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
    });
};

exports.postAddProject = async (req, res, next) => {
    const name = req.body.name;
    const title = req.body.title;
    const image = req.files;
    const description = req.body.description;
    if (image.length == 0) {
      return res.status(422).render('edit-project', {
        pageTitle: 'Add Project',
        editing: false,
        hasError: true,
        project: {
            name: name,
            title: title,
            description: description,
        },
        errorMessage: 'Attached file is not an image.',
        validationErrors: [],
      });
    }
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render('edit-project', {
        pageTitle: 'Add Project',
        editing: false,
        hasError: true,
        project: {
            name: name,
            title: title,
            description: description,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
 
    await drive.files
    .create({
        resource: {
        name: image[0].filename,
        parents: ['1EnNIqabanVcxfYkt3DYgFxsjn5kr4lkR'],
        },
        media: {
            mimeType: image[0].mimetype,
            body: fs.createReadStream(image[0].path),
        },
        fields: 'id',
    })
    .then(result => {
        imageUrl = result.data.id;
    });

    const project = new Project({
      name: name,
      title: title,
      description: description,
      imageUrl: imageUrl,
    });
    project
      .save()
      .then(result => {
        // console.log(result);
        console.log('Created Project');
        res.redirect('/projects');
      })
      .catch(err => {
        console.log(err);
      });
};

exports.getEditProject = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const projsId = req.params.projectId;
  Project.findById(projsId)
    .then(project => {
      if (!project) {
        return res.redirect('/');
      }
      res.render('edit-project', {
        pageTitle: 'Edit Project',
        path: '/admin/edit-project',
        editing: editMode,
        project: project,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.postEditProject = (req, res, next) => {
  const projId = req.body.projectId;
  const updatedName = req.body.name;
  const updatedTitle = req.body.title;
  const image = req.files;
  const updatedDesc = req.body.description;
  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('edit-project', {
      pageTitle: 'Edit Project',
      editing: false,
      hasError: true,
      project: {
        name: name,
        title: title,
        description: description,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: [],
    });
  }

  Project.findById(projId)
    .then(async project => {
      // if (project.userId.toString() !== req.user._id.toString()) {
      //   console.log();
      //   return res.redirect('/');
      // }
      project.name = updatedName;
      project.title = updatedTitle;
      project.description = updatedDesc;
      

      if (image.length !== 0) {
        drive.files.delete({
          fileId: project.imageUrl,
        });

        await drive.files
        .create({
          resource: {
            name: image[0].filename,
            parents: ['1EnNIqabanVcxfYkt3DYgFxsjn5kr4lkR'],
          },
          media: {
            mimeType: image[0].mimetype,
            body: fs.createReadStream(image[0].path),
          },
          fields: 'id',
        })
        .then(result => {
          imageUrl = result.data.id;
        });
        project.imageUrl = imageUrl;
        project
          .save()
          .then(result => {
            // console.log(result);
            console.log('UPDATED Project');
            res.redirect('/projects');
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        return project.save().then(result => {
          console.log('UPDATED Project!');
          res.redirect('/projects');
        });
      }
    })
    .catch(err => {
      console.log(err);
    });
};

exports.deleteProject = (req, res, next) => {
  const projId = req.body.projectId;
  Project.findById(projId)
    .then(project => {
      if (!project) {
        return next(new Error('Project not found'));
      }
      if (project.imageUrl) {
        drive.files.delete({
          fileId: project.imageUrl,
        });
      }
      return Project.deleteOne({ _id: projId });
    })
    .then(() => {
      console.log('DESTROYED Project');
      res.redirect('/projects');
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getReviews = (req, res, next) => {
  const REVIEW_PER_PAGE = 1;
  const page = +req.query.page || 1;
  let totalReviews;

  Review.find()
      .countDocuments()
      .then(numReviews => {
      totalReviews = numReviews;
      return Review.find()
          .skip((page - 1) * REVIEW_PER_PAGE)
          .limit(REVIEW_PER_PAGE);
      })
      .then(reviews => {
      res.render('reviews', {
          pageTitle: 'Reviews',
          reviews: reviews,
          currentPage: page,
          itemPerPage: REVIEW_PER_PAGE,
          totalReviews: totalReviews,
          hasNextPage: REVIEW_PER_PAGE * page < totalReviews,
          hasPreviousPage: page > 1,
          nextPage: page + 1,
          previousPage: page - 1,
          lastPage: Math.ceil(totalReviews / REVIEW_PER_PAGE),
      });
      })
      .catch(err => {
      console.log(err);
      });
};

exports.getAddReview = (req, res, next) => {
  res.render('edit-review', {
      pageTitle: 'Admin review',
      editing: false,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
  });
};

exports.postAddReview = async (req, res, next) => {
  const name = req.body.name;
  const address = req.body.address;
  const image = req.files;
  const comment = req.body.comment;
  const rating = req.body.rating;
  if (image.length == 0) {
    return res.status(422).render('edit-review', {
      pageTitle: 'Add Review',
      editing: false,
      hasError: true,
      review: {
          name: name,
          address: address,
          comment: comment,
          rating: rating,
      },
      errorMessage: 'Attached file is not an image.',
      validationErrors: [],
    });
  }
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('edit-review', {
      pageTitle: 'Add Review',
      editing: false,
      hasError: true,
      review: {
        name: name,
        address: address,
        comment: comment,
        rating: rating,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  await drive.files
  .create({
      resource: {
      name: image[0].filename,
      parents: ['1ojes3QiIXk0WW0RtKGgcnwNrYinfqJ7C'],
      },
      media: {
          mimeType: image[0].mimetype,
          body: fs.createReadStream(image[0].path),
      },
      fields: 'id',
  })
  .then(result => {
      imageUrl = result.data.id;
  });

  const review = new Review({
    name: name,
    address: address,
    comment: comment,
    rating: rating,
    imageUrl: imageUrl,
  });
  review
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Review');
      res.redirect('/reviews');
    })
    .catch(err => {
      console.log(err);
    });
};


exports.getEditReview = (req, res, next) => {
const editMode = req.query.edit;
if (!editMode) {
  return res.redirect('/');
}
const reviewId = req.params.reviewId;
Review.findById(reviewId)
  .then(review => {
    if (!review) {
      return res.redirect('/');
    }
    res.render('edit-review', {
      pageTitle: 'Edit Review',
      editing: editMode,
      review: review,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  })
  .catch(err => {
    console.log(err);
  });
};


exports.postEditReview = (req, res, next) => {
const reviewId = req.body.reviewId;
const updatedName = req.body.name;
const updatedAddress = req.body.address;
const updatedRating = req.body.rating;
const updatedComment = req.body.comment;
const image = req.files;
const errors = validationResult(req);


if (!errors.isEmpty()) {
  console.log(errors.array());
  return res.status(422).render('edit-review', {
    pageTitle: 'Edit Project',
    editing: false,
    hasError: true,
    review: {
      name: name,
      address: address,
      comment: comment,
      rating: rating,
    },
    errorMessage: errors.array()[0].msg,
    validationErrors: [],
  });
}

Review.findById(reviewId)
  .then(async review => {
    // if (review.userId.toString() !== req.user._id.toString()) {
    //   console.log();
    //   return res.redirect('/');
    // }
    review.name = updatedName;
    review.address = updatedAddress;
    review.comment = updatedComment;
    review.rating = updatedRating;
    

    if (image.length !== 0) {
      drive.files.delete({
        fileId: review.imageUrl,
      });

      await drive.files
      .create({
        resource: {
          name: image[0].filename,
          parents: ['1ojes3QiIXk0WW0RtKGgcnwNrYinfqJ7C'],
        },
        media: {
          mimeType: image[0].mimetype,
          body: fs.createReadStream(image[0].path),
        },
        fields: 'id',
      })
      .then(result => {
        imageUrl = result.data.id;
      });
      review.imageUrl = imageUrl;
      review
        .save()
        .then(result => {
          // console.log(result);
          console.log('UPDATED Review');
          res.redirect('/reviews');
        })
        .catch(err => {
          console.log(err);
        });
    } else {
      return review.save().then(result => {
        console.log('UPDATED Review!');
        res.redirect('/reviews');
      });
    }
  })
  .catch(err => {
    console.log(err);
  });
};

exports.deleteReview = (req, res, next) => {
const reviewId = req.body.reviewId;
Project.findById(reviewId)
  .then(review => {
    if (!review) {
      return next(new Error('Review not found'));
    }
    if (review.imageUrl) {
      drive.files.delete({
        fileId: review.imageUrl,
      });
    }
    return Review.deleteOne({ _id: reviewId });
  })
  .then(() => {
    console.log('DESTROYED Review');
    res.redirect('/reviews');
  })
  .catch(err => {
    console.log(err);
  });
};