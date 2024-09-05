

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

