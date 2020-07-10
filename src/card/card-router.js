/* eslint-disable strict */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');
const { cards, lists } = require('../store');

const cardRouter = express.Router();
const bodyParser = express.json();


//GET & POST CARD  
cardRouter
  .route('/card')
  .get((req, res) => {
    res
      .json(cards);
  })
  .post(bodyParser, (req, res) => {
    const { title, content } = req.body;
    if (!title) {
      logger.error('Title is required');
      return res
        .status(400)
        .send('Invalid data');
    }
    
    if (!content) {
      logger.error('Content is required');
      return res
        .status(400)
        .send('Invalid data');
    }
  
    // get an id
    const id = uuidv4();
  
    const card = {
      id,
      title,
      content
    };
  
    cards.push(card);
    logger.info(`Card with id ${id} created`);
  
    res
      .status(201)
      .location(`http://localhost:8000/card/${id}`)
      .json(card);
  });


//GET & DELETE CARD w/ ID
cardRouter
  .route('/card/:id')
  .get((req, res) => {
    const { id } = req.params;
    const card = cards.find(c => c.id == id);
  
    // make sure we found a card
    if (!card) {
      logger.error(`Card with id ${id} not found.`);
      return res
        .status(404)
        .send('Card Not Found');
    }
  
    res.json(card);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const cardIndex = cards.findIndex(c => c.id == id);
  
    if (cardIndex === -1) {
      logger.error(`Card with id ${id} not found.`);
      return res
        .status(404)
        .send('Not found');
    }
  
    //remove card from lists
    //assume cardIds are not duplicated in the cardIds array

    lists.forEach(list => {                                    //<--- LOOP thru Array
      const cardIds = list.cardIds.filter(cid => cid !== id);  //<--- FILTER out Array
      list.cardIds = cardIds;
    });
  
    cards.splice(cardIndex, 1);                                //<--- DELETE from Array
  
    logger.info(`Card with id ${id} deleted.`);
  
    res
      .status(204)
      .end();
  });


module.exports = cardRouter;