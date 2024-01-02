/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const mongoose = require('mongoose');

chai.use(chaiHttp);

const { createBook, deleteAllBooks } = require('../services/BookService');

suite('Functional Tests', function() {

  const http_post = 'post';
  const http_get = 'get';
  const http_put = 'put';
  const http_delete = 'delete';
  
  function sendReqAndTest (url, testFn, http_verb = http_get, body = null) {
      let req = chai.request(server).keepOpen();

      if (http_post === http_verb || http_put === http_verb || http_delete === http_verb) {
          switch (http_verb) {
              case http_post:
                  req = req.post(url);
                  break;
              case http_put:
                  req = req.put(url);
                  break;
              case http_delete:
                  req = req.delete(url);
                  break;
          }

          if (body) {
              req = req.send(body);
          }
      } else {
          req = req.get(url);
      }

      req.end((err, res) => {
          testFn(err, res);
      });
  }


  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  // test('#example Test GET /api/books', function(done){
  //    chai.request(server)
  //     .get('/api/books')
  //     .end(function(err, res){
  //       assert.equal(res.status, 200);
  //       assert.isArray(res.body, 'response should be an array');
  //       assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
  //       assert.property(res.body[0], 'title', 'Books in array should contain title');
  //       assert.property(res.body[0], '_id', 'Books in array should contain _id');
  //       done();
  //     });
  // });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {

    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
          const title = 'my new book';
        
          sendReqAndTest('/api/books', (err, res) => {
              const book = res.body;
              assert.equal(res.status, 200, 'response status should be 200');
              assert.property(book, '_id', 'book should contain _id');
              assert.property(book, 'title', 'book should contain title');
              assert.equal(book.title, title, 'book title should be equal to title');
              done();
          }, http_post, { title });
      });
      
      test('Test POST /api/books with no title given', function(done) {
          sendReqAndTest('/api/books', (err, res) => {
              const result = res.text;
              assert.equal(res.status, 200, 'response status should be 200');
              assert.equal(result, 'missing required field title');
              done();
          }, http_post);
      });

      suiteTeardown(async () => {
        await deleteAllBooks();
      });
      
    });


    suite('GET /api/books => array of books', function(){

      const createdBookIds = [];
      suiteSetup(async () => {
        for (i = 0; i < 10; i++) {
          const title = `test book title ${i}`;
          const book = await createBook(title);
          createdBookIds.push(book._id);
        }
      });

      test('Test GET /api/books',  function(done){
        sendReqAndTest('/api/books', (err, res) => {
          const result = res.body;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(result.length, 10, 'result should contain 10 books');
          assert.property(result[0], '_id', 'book should contain _id');
          assert.property(result[0], 'title', 'book should contain title');
          assert.property(result[0], 'commentcount', 'book should contain commentcount');
          done();
        });
      });   

      suiteTeardown(async () => {
        await deleteAllBooks();
      });
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      const createdBookIds = [];
      suiteSetup(async () => {
        for (i = 0; i < 10; i++) {
          const title = `test book title ${i}`;
          const book = await createBook(title);
          createdBookIds.push(book._id);
        }
      });

      test('Test GET /api/books/[id] with id not in db',  function(done){
        const id = new mongoose.Types.ObjectId().toString();

        sendReqAndTest(`/api/books/${id}`, (err, res) => {
          const result = res.text;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(result, 'no book exists');
          done();
        });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        const id = createdBookIds[9];
        
        sendReqAndTest(`/api/books/${id}`, (err, res) => {
          const book = res.body;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.property(book, '_id', 'book should contain _id');
          assert.property(book, 'title', 'book should contain title');
          assert.property(book, 'comments', 'book should contain commentcount');
          assert.isArray(book.comments);
          done();
        });
      });
      
      suiteTeardown(async () => {
        await deleteAllBooks();
      });

    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      const createdBookIds = [];
      suiteSetup(async () => {
        for (i = 0; i < 10; i++) {
          const title = `test book title ${i}`;
          const book = await createBook(title);
          createdBookIds.push(book._id);
        }
      });

      test('Test POST /api/books/[id] with comment', function(done){       
        const id = createdBookIds[2];
        const comment = 'test comment 1';
        
        sendReqAndTest(`/api/books/${id}`, (err, res) => {
          const book = res.body;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.property(book, '_id', 'book should contain _id');
          assert.property(book, 'title', 'book should contain title');
          assert.property(book, 'comments', 'book should contain commentcount');
          assert.isArray(book.comments);
          assert.equal(book.comments[0], comment);
          done();
        }, http_post, { comment });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        const id = createdBookIds[2];
        const comment = 'test comment 1';

        sendReqAndTest(`/api/books/${id}`, (err, res) => {
          const result = res.text;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(result, 'missing required field comment');
          done();
        }, http_post);
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        const id = new mongoose.Types.ObjectId().toString();
        const comment = 'test comment 1';

        sendReqAndTest(`/api/books/${id}`, (err, res) => {
          const result = res.text;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(result, 'no book exists');
          done();
        }, http_post, { comment });
      });
      
      suiteTeardown(async () => {
        await deleteAllBooks();
      });

    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      const createdBookIds = [];
      suiteSetup(async () => {
        for (i = 0; i < 10; i++) {
          const title = `test book title ${i}`;
          const book = await createBook(title);
          createdBookIds.push(book._id);
        }
      });

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        const id = createdBookIds[3];
        sendReqAndTest(`/api/books/${id}`, (err, res) => {
          const result = res.text;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(result, 'delete successful');
          done();
        }, http_delete);
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
        const id = new mongoose.Types.ObjectId().toString();
        sendReqAndTest(`/api/books/${id}`, (err, res) => {
          const result = res.text;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(result, 'no book exists');
          done();
        }, http_delete);
      });

      test('Test DELETE /api/books', function(done){
        sendReqAndTest('/api/books/', (err, res) => {
          const result = res.text;
          assert.equal(res.status, 200, 'response status should be 200');
          assert.equal(result, 'complete delete successful');
          done();
        }, http_delete);
      });

      suiteTeardown(async () => {
        await deleteAllBooks();
      });
    });

  });

});
