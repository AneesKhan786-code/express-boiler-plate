// import multer from 'multer';
// import multerS3 from 'multer-s3';
// import { s3 } from '@/config/aws';
// import { Request } from 'express';
// import dotenv from 'dotenv';

// dotenv.config();

// const bucket = process.env.AWS_BUCKET_NAME!;

// export const upload = multer({
//   storage: multerS3({
//     s3: s3, // ✅ S3 from AWS SDK v2
//     bucket: bucket,
//     acl: 'public-read',
//     metadata: (
//       req: Request,
//       file: Express.Multer.File,
//       cb: (error: any, metadata?: any) => void
//     ) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (
//       req: Request,
//       file: Express.Multer.File,
//       cb: (error: any, key?: string) => void
//     ) => {
//       cb(null, `uploads/${Date.now()}-${file.originalname}`);
//     },
//   }),
// });