import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {

    const headerList = headers()
    const { requestId } = await request.json();

    const credentials = {
        clientId: headerList.get('x-client-id'),
        clientSecret: headerList.get('x-client-secret'),
        productInstanceId: headerList.get('x-product-instance-id'),
    };

    console.log('req id ', requestId, credentials)

    try {
        const setuResponse = await fetch(`https://dg-sandbox.setu.co/api/signature/${requestId}/download`, {
            method: "GET",
            headers: {
                "x-client-id": credentials.clientId ? credentials.clientId : "",
                "x-client-secret": credentials.clientSecret ? credentials.clientSecret : "",
                "x-product-instance-id": credentials.productInstanceId ? credentials.productInstanceId : "",
            },
        });

        const data = await setuResponse.json();
        console.log(data)

        return NextResponse.json(data, { status: setuResponse.status });
    } catch (error) {
        console.error('Error in download route:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}