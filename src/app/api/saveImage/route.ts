

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs';
import crypto from 'crypto';
import {PrismaClient} from '@prisma/client'


 const prisma = new PrismaClient();


export async function POST(req: NextRequest) {

    console.log("in api");

    try {

        const data = await req.json();
        const file = data.base64;

        // Ensure the base64 string does not include the data URL prefix
        const base64Data = file.replace(/^data:image\/\w+;base64,/, '');

         // Convert file to buffer
        const buffer = Buffer.from(base64Data, 'base64');

        await fs.promises.mkdir('public/uploads', { recursive: true });

        const path = `public/uploads/${crypto.randomUUID()}.png`;

        await fs.promises.writeFile(path, buffer as any);

        const user = await prisma.users.update({
            where: {
              id: "66d6f3862eda2500c745a1ec", 
            },
            data: {
              image: {
                push: path.replace("public", "")
              },
            },
          });

        // const user = await prisma.users.create({
        //     data:{
        //         image:{
        //             set: [path.replace("public", "")]
        //         }
        //     }
        // })


        return NextResponse.json({
            message: "File uploaded successfully",
            user,
        },{status: 200});

    } catch (error: any) {
        console.log("error in catch: ", error);
        return NextResponse.json(
            {
                message: "Error uploading file",
                error: error.message,
            },
            {
                status: 400
            }
        );
    }
}






export async function GET(req: NextRequest){
    
    const user = await prisma.users.findMany();


    return NextResponse.json(user);
 }



 
 


export async function DELETE(req: NextRequest) {
  try {
    // Extract query parameters
    const url = new URL(req.url);
    const imageToDelete = url.searchParams.get('image');
    
    if (!imageToDelete) {
      return NextResponse.json({ error: 'Image parameter is required' }, { status: 400 });
    }

    // Assuming you have a user ID available, replace with your method of obtaining the user ID
    const userId = '66d6f3862eda2500c745a1ec';

    // Fetch the user to get the existing images
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { image: true }, // Only select the `image` field to reduce query size
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if `user.image` is an array
    const userImages = Array.isArray(user.image) ? user.image : [];

    // Filter out the image to be deleted
    const updatedImages = userImages.filter(img => img !== imageToDelete);

    // Ensure that an image is actually removed
    if (userImages.length === updatedImages.length) {
      return NextResponse.json({ error: 'Image not found in user images' }, { status: 404 });
    }

    // Update the user record with the new list of images
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: { image: updatedImages },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
