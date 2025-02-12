const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

app.get('/api/nodejs', async (req, res) => {
  try {
    const url = req.query.url;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is missing.' });
    }

    const response = await axios.get(url);
    const html = response.data;

    // Parse the HTML content using cheerio
    const $ = cheerio.load(html);
    const pageTitle = $('title').text();
    const summary = $('div.mw-parser-output > p').first().text();
    const firstSectionContent = $('div.mw-parser-output > p').eq(1).text();
    const secondSectionContent = $('div.mw-parser-output > p').eq(2).text();
    const thirdSectionContent = $('div.mw-parser-output > p').eq(3).text();
    const fourthSectionContent = $('div.mw-parser-output > p').eq(4).text();

    // Extract URLs of categories from the Wikipedia page
    const categoryUrls = [];
    $('div.mw-normal-catlinks ul li a').each((index, element) => {
      categoryUrls.push($(element).attr('href'));
    });

    // Extract the image URL from the infobox if available
    let imageUrl = '';
    const infoboxImage = $('.infobox img');
    if (infoboxImage.length > 0) {
      imageUrl = infoboxImage.attr('src');
    }

    res.json({
      imageUrl,
      title: pageTitle,
      summary,
      firstSectionContent,
      secondSectionContent,
      thirdSectionContent,
      fourthSectionContent,
      categories: categoryUrls,
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
