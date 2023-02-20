// Necessary imports

const express = require('express');
const fs = require('fs');
const {v4 : uuidv4} = require('uuid')
const path = require('path');

const app = express();
const PORT = 3001;

const notes = require('./db/db.json');



// Middleware setup for public folder

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static('public'));



// Helper functions for writing the note to JSON file.

const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );


const readAndAppend = (content, file) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
      } else {
        const parsedData = JSON.parse(data);
        parsedData.push(content);
        writeToFile(file, parsedData);
      }
    });
  };
  


// GET requests for home and notes pages.

app.get('/', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/index.html'))
);
app.get('/notes', (req, res) => 
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);


// API GET and POST requests.

app.route('/api/notes')
.get((req, res) => res.sendFile(path.join(__dirname, './db/db.json')))
.post((req, res) => {

    const { title, text } = req.body;

   if (req.body) {
         const newNote = {
            title, 
             text,
             id: uuidv4()
         }
         readAndAppend(newNote, './db/db.json');
         console.log(`Note added successfully.`);
         res.json(notes);
     } else {
     console.error('Error in adding note');
     }
 });



// API DELETE requests.
    
app.delete('/api/notes/:id', (req, res) => {

    console.info(`${req.method} request received.`);


    fs.readFile(path.join(__dirname, './db/db.json'), 'utf8', (err, data) => {

        if (err) {
            console.error('There was a problem reading the file.')
            req.status(500).end(); 
        };

        const container = JSON.parse(data); 

        for (let i=0; i<container.length;i++) {
            if (container[i].id == req.params.id) {
                container.splice(container[i], 1);
            } 
        }


        fs.writeFile(path.join(__dirname, './db/db.json'), JSON.stringify(container), (err) => {

            if (err) {
                console.error('There was a problem deleting the note.')
                req.status(500).end(); 
            };
        });

        res.status(200).end();
    })
});


// PORT setup.

app.listen(PORT, () =>
  console.log(`Notes app listening at http://localhost:${PORT}`)
);
