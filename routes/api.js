'use strict';

const BookController = require('../controllers/book.controller');

module.exports = function (app) {

  app.route('/api/books')
    .get(BookController.getAllBooks)
    .post(BookController.createBook)
    .delete(BookController.deleteAllBooks);

  app.route('/api/books/:id')
    .get(BookController.getBookById)
    .post(BookController.addComment)
    .delete(BookController.deleteBookById);

};
