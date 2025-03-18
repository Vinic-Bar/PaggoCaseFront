import { NextRequest, NextResponse } from 'next/server';
import formidable, { IncomingForm } from 'formidable';
import { Readable } from 'stream';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), '.', '..', 'uploads');

class ReadableStream extends Readable {
  headers: { [key: string]: string };
  constructor(buffer: Buffer, headers: { [key: string]: string }) {
    super();
    this.headers = headers;
    this.push(buffer);
    this.push(null);
  }
}

export async function POST(req: NextRequest) {
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  const arrayBuffer = await req.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const headers = {
    'content-type': req.headers.get('content-type') || '',
    'content-length': buffer.length.toString(),
  };

  const stream = new ReadableStream(buffer, headers);

  return new Promise((resolve) => {
    form.parse(stream as any, (err, fields, files) => {
      if (err) {
        console.error('Error parsing the files', err);
        resolve(NextResponse.json({ error: 'Error parsing the files' }, { status: 500 }));
        return;
      }

      if (!files.file) {
        resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
        return;
      }
      const file = Array.isArray(files.file) ? files.file[0] : files.file as formidable.File;
      const filePath = path.join(uploadDir, file.newFilename);

      resolve(NextResponse.json({ filePath }));
    });
  });
}