const {nanoid} = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const id = nanoid(16); // membuat karakter string acak sepanjang 16 karakter
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt; // nilai sama dengan insertedAt karena untuk nyimpen buku baru

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload; // membaca request body

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    insertedAt,
    updatedAt,
    finished: pageCount === readPage,
  };

  if (name === '' || name === undefined || name === null) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message:
        'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request, h) => { //Kriteria 2 : API dapat menampilkan seluruh buku
  let responseBody;
  const query = request.query;// ngambil query daru url dengan nilai berupa object
  const {name, reading, finished} = query;// object destructuring, memasukkan value dari property object ke variabel

  if (name) {// jika name memiliki value, maka di jalankan, jika tidak memiliki value, tidak di jalankan
    const array = [];
    for (let i=0; i<books.length; i++) {
      if (books[i].name.toLowerCase().includes(name.toLowerCase())) {
        const {id, name, publisher} = books[i];
        array.push({id, name, publisher});
      }
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  }

  if (reading && Number(reading) === 0 || Number(reading) === 1) {// jika reading bernilai 0 atau 1, akan dijalankan
    const array = [];
    for (let i=0; i<books.length; i++) {
      if (books[i].reading == reading) {
        const {id, name, publisher} = books[i];
        array.push({id, name, publisher});
      }
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  }

  if (finished && Number(finished) === 0 || Number(finished) === 1) {// jika finished bernilai 0 atau 1, akan dijalankan
    const array = [];
    for (let i=0; i<books.length; i++) {
      if (books[i].finished == finished) {
        const {id, name, publisher} = books[i];
        array.push({id, name, publisher});
      }
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;

  } else if (finished && Number(finished) !== 0 && Number(finished) !== 1) {// jika finished bukan bernilai 0 atau 1
    const array = [];
    for (let i=0; i<books.length; i++) {
      array.push(
          {id: books[i].id, name: books[i].name, publisher: books[i].publisher},
      );
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  }
  
  if (books.length > 0 && !name && !reading && !finished) {
    const array = [];
    for (let i=0; i<books.length; i++) {
      array.push(
          {id: books[i].id, name: books[i].name, publisher: books[i].publisher},
      );
    }
    responseBody = {
      'status': 'success',
      'data': {
        'books': array,
      },
    };
    return responseBody;
  } else {
    responseBody = {
      status: 'success',
      data: {
        books,
      },
    };
    return responseBody;
  }
};

const getBookByIdHandler = (request, h) => { //Kriteria 3 : API dapat menampilkan detail buku
  const {id} = request.params;

  const book = books.filter((b) => b.id === id)[0];// book merupakan object, kalo filter tidak terpenuhi maka menjadi undefined

  if (book !== undefined) {// kalo book undefined tidak akan dijalankan
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({ //Bila buku dengan id yang dilampirkan oleh client tidak ditemukan
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => { //Kriteria 4 : API dapat mengubah data buku
  const checkName = request.payload.hasOwnProperty('name');
  const {readPage, pageCount} = request.payload;
  const checkReadPage = readPage <= pageCount;

  if (!checkName) {// Client tidak melampirkan properti name pada request body
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;

  } else if (!checkReadPage) {// nilai properti readPage yang lebih besar dari nilai properti pageCount
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;

  } else if (checkName && checkReadPage) { 
    const {id} = request.params;

    const {name, year, author, summary, publisher, pageCount, readPage, reading} = request.payload;
    const updatedAt = new Date().toISOString();

    const index = books.findIndex((book) => book.id === id);

    if (index !== -1) {
      books[index] = {
        ...books[index],
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        reading,
        updatedAt,
      };

      const response = h.response({ //Bila buku berhasil diperbarui
        status: 'success',
        message: 'Buku berhasil diperbarui',
      });
      response.code(200);
      return response;
    }
 
    const response = h.response({ //Id yang dilampirkan oleh client tidak ditemukkan oleh server
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  }
};

const deleteBookByIdHandler = (request, h) => { //Kriteria 5 : API dapat menghapus buku
  const {id} = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({ //Bila id dimiliki oleh salah satu buku
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({ //Bila id yang dilampirkan tidak dimiliki oleh buku manapun
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
