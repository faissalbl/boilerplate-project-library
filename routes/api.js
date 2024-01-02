/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const { 
  createBook, getBooks, getBookById, 
  addComment, deleteBook, deleteAllBooks, 
} = require('../services/BookService');

module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const books = await getBooks();
      return res.json(books);
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      if (!title) return res.send('missing required field title');
      //response will contain new book object including atleast _id and title
      const book = await createBook(title);
      return res.json(book);
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      const deletedCount = await deleteAllBooks();
      if (deletedCount > 0) return res.send('complete delete successful');
      else return res.end();
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      const bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      const book = await getBookById(bookid);
      if (!book) return res.send('no book exists');
      return res.json(book);
    })
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) return res.send('missing required field comment');
      const book = await addComment(bookid, comment);
      if (!book) return res.send('no book exists');
      return res.json(book);
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      const deletedBook = await deleteBook(bookid);
      if (deletedBook) return res.send('delete successful');
      else return res.send('no book exists');
    });
  
};
