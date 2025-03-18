import { NextRequest, NextResponse } from 'next/server';
import formidable, { IncomingForm, Fields, Files } from 'formidable';
import { PassThrough } from 'stream';
import path from 'path';
import { IncomingMessage } from 'http';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), '.', '..', 'uploads');

class BufferStream extends PassThrough {
  headers: { [key: string]: string };
  constructor(buffer: Buffer, headers: { [key: string]: string }) {
    super();
    this.headers = headers;
    this.end(buffer);
  }
}

export async function POST(req: NextRequest): Promise<Response> {
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

  const stream = new BufferStream(buffer, headers);

  return new Promise<Response>((resolve) => {
    form.parse(stream as unknown as IncomingMessage, (err: Error, fields: Fields, files: Files) => {
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