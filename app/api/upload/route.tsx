import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const headerList = headers()
        // console.log(headerList)

        const formData = await request.formData();
        // console.log('form data ', formData)

        const credentials = {
            clientId: headerList.get('x-client-id'),
            clientSecret: headerList.get('x-client-secret'),
            productInstanceId: headerList.get('x-product-instance-id'),
        };

        // when password set to null the sign link works 
        // console.log('server password ', formData.get('password'))

        const setuResponse = await fetch("https://dg-sandbox.setu.co/api/documents", {
            method: "POST",
            headers: {
                "x-client-id": credentials.clientId ? credentials.clientId : "",
                "x-client-secret": credentials.clientSecret ? credentials.clientSecret : "",
                "x-product-instance-id": credentials.productInstanceId ? credentials.productInstanceId : "",
            },
            body: formData,
        });

        const data = await setuResponse.json();
        console.log('recieved document response ', data)

        return NextResponse.json(data, { status: setuResponse.status });
    } catch (error) {
        console.error('Error in proxy route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}