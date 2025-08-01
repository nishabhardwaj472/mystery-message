import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import {success, z} from 'zod';
import { usernameValidation } from "@/schemas/signUpSchema";


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request:Request) {

    //use this in all other routes
    console.log(`Received request with method: ${request.method}`);
    if(request.method != 'GET'){
        return Response.json(
            {
             success: false,
            message:  'Method not allowed',
            }, {status: 405}
        )
    }

    await dbConnect()
    //localhost:3000/api/cuu?username=nisha

    try {
        const {searchParams} = new URL(request.url)
        const queryParam = {
            username:searchParams.get('username')
        }
        //validate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result)//remove
        if(!result.success){
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json(
                {
                    success: false,
                    message: usernameErrors?.length > 0
                    ?usernameErrors.join(', ')
                    : 'Invalid query parameters',
                }, {status: 400}
            )
        }

        const {username} = result.data

        const existingVerifiedUser = UserModel.findOne({ username, isVerified: true})

        if (!existingVerifiedUser){
             return Response.json(
                {
                    success: false,
                    message:  'Username already taken',
                }, {status: 400}
            )
        }

        return Response.json(
                {
                    success: true,
                    message:  'Username is unique',
                }, {status: 400}
            )

    } catch (error) {
        console.error("Error checking username", error)
        return Response.json(
            {
                success: false,
                message: "Error checking username"
            },
            {status: 500}
        )
    }
}