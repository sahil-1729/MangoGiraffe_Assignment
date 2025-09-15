import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const headerList = headers()
        const requestBody = await request.json();
        // console.log('signature request body ', JSON.parse(requestBody))

        const credentials = {
            clientId: headerList.get('x-client-id'),
            clientSecret: headerList.get('x-client-secret'),
            productInstanceId: headerList.get('x-product-instance-id'),
        };

        const setuResponse = await fetch("https://dg-sandbox.setu.co/api/signature", {
            method: "POST",
            headers: {
                "x-client-id": credentials.clientId ? credentials.clientId : "",
                "x-client-secret": credentials.clientSecret ? credentials.clientSecret : "",
                "x-product-instance-id": credentials.productInstanceId ? credentials.productInstanceId : "",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await setuResponse.json();
        console.log('signature response ', data)

        return NextResponse.json(data, { status: setuResponse.status });
    } catch (error) {
        console.error('Error in proxy route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}