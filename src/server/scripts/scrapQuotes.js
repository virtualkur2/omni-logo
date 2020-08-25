const { exec } = require('child_process');
const path = require('path');
const mongoose = require('mongoose');
const dbHelper = require('../helpers/db.helper');
const Quote = require('../models/quote.model');

console.log(__dirname);
const command = `python3 ${path.join(__dirname, 'scrapQuotes.py')}`;

const uniqueElement = function(value, index, self) {
  return self.indexOf(value) === index;
}

dbHelper.connect()
.then(async () => {
  console.info('Successfully connected to DB');
  try {
    const quotesQuantity = await Quote.estimatedDocumentCount().exec();
    if(!quotesQuantity) {
      console.info('Start scrapping...');
      return exec(command, async (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          throw error;
        }
        if(stderr) {
          console.error(`stderr: ${stderr}`);
          throw new Error(stderr);
        }
        try {
          console.info('Scraping completed');
          console.log('Saving data on DB');

          const response = JSON.parse(stdout);
          const quotes = response.quotes;

          //add DavidDPG personal quotes:
          quotes.push({
            quote: 'Piensas que el mundo de la programación está lleno de mentes brillantes, hasta que te decides a prestar ayuda en StackOverflow.',
            author: 'DavidDPG'
          });
          quotes.push({
            quote: 'Me he visto en etrevistas de trabajo en las que me ofrecen empezar con un sueldo bajo que se incrementaría más tarde; en estos casos respondo muy respetuosamente: "Llámenme ustedes cuando sea más tarde".',
            author: 'DavidDPG'
          });

          // change status of all quotes to approved
          for(let quote of quotes) {
            quote.approved = true;
          }
          const insertedQuotes = await Quote.insertMany(quotes);
          const count = await Quote.estimatedDocumentCount().exec();
              
          console.log('Quotes saved correctly.');
          console.log(`Number of estimated documents in collection: ${count}.`);
          console.log(insertedQuotes);
          return;
        } catch (error) {
          console.error(error.message);
          throw error;
        }
      });
    }
    const insertedQuotes = await Quote.find().exec();
    const authors = insertedQuotes.map(quote => quote.author).filter((author, index, self) => {
      return self.indexOf(author) === index;
    });
    console.log(authors);
    // const wikipediaURLsByAuthors = [];
    console.log(`Number of estimated documents in collection: ${quotesQuantity}.`);
    console.log(`Number of differents authors: ${authors.length}.`);
    const connectionState = dbHelper.getConnectionState();
    if(connectionState.stateCode || connectionState.stateCode !== 99) {
      dbHelper.disconnect()
      .then(() => {
        console.info('DB succesffully disconnected');
        process.exit(0);
      })
      .catch(e => {
        console.error(`Connection to DB not properly closed, terminating process.`);
        process.exit(1);
      });
    }
  } catch(error) {
    console.error(error.message);
    dbHelper.disconnect()
    .then(() => {
      console.info('DB succesffully disconnected');
      process.exit(0);
    })
    .catch(e => {
      console.error(`Connection to DB not properly closed, terminating process.`);
      process.exit(1);
    });
  }
})
.catch((error) => {
  console.error(`Connection to DB could not complete successfully: ${error.message}`);
});
