import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { example, example2 } from './lib/faker.js';
import { execFileSync } from 'child_process';

const app = express();
app.use(express.json());

const port = 3000;

const renderMarkupToFile = async (markupfile) => {
  const file = await fs.open(markupfile, 'w+');

  let content = 'Hello World';
  // content += '[magnify: width 2; height 2]';
  // content += '[column: left ORDER 1; right Time 12:34 PM]';
  // content += '[column: left > Hamburger; right * 1 [ ]]';
  // content += '[column: left > French fries; right * 2 [ ]]';
  // content += '[column: left > Coke]';
  // content += '[column: left - Large; right * 1 [ ]; indent 60]';
  // content += '[cut: feed; partial]';

  await file.writeFile(content);
  await file.close();
};

app
  .route('/')
  .post((req, res) => {
    console.log('Checking data');

    const result = {
      jobReady: false,
    };

    const { clientAction } = req.body;
    if (clientAction) {
      console.log(clientAction);
    } else {
      const data = example.pop();
      if (data) {
        const { jobToken, mediaType } = data;
        console.log(mediaType);
        console.log('...');
        result.jobReady = true;
        result.jobToken = jobToken;
        result.mediaTypes = [mediaType];
      }
    }

    res.json(result);
  })
  .get(async (req, res) => {
    console.log('Fetching Data');

    const [jobToken, contentType] = [req.query.token, req.query.type];
    // if (contentType !== 'text/plain') {
    //   return res.status(415).end();
    // }

    const data = example2.find((item) => item.jobToken === jobToken);
    if (!data) {
      return res.status(404).end();
    }

    const basefile = await fs.mkdtemp(
      path.join(path.dirname('./tempFiles/test.txt'), 'markup')
    );
    const markupfile = `${basefile}.stm`;
    // const outputFile = await fs.mkdtemp(
    //   path.join(path.dirname('./tempFiles/test.txt'), 'output')
    // );

    await renderMarkupToFile(markupfile);

    // execFileSync('cputil', [
    //   'thermal2',
    //   'scale-to-fit',
    //   'dither',
    //   'decode',
    //   'text/plain',
    //   markupfile,
    //   outputFile,
    // ]);

    const fileContent = await fs.readFile(markupfile);

    res.set({
      'Content-Type': contentType,
      'Content-Length': fileContent.length,
    });
    res.status(200).send(fileContent);

    await fs.unlink(markupfile);
    await fs.rmdir(basefile);
  })
  .delete((req, res) => {
    console.log('Deleting Data');

    const code = req.query.code;
    const jobToken = req.query.token;

    console.log(code);
    console.log(jobToken);

    res.status(200).end();
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
