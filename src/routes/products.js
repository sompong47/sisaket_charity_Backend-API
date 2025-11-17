import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function GET(request) {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true });
    
    return NextResponse.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const product = await Product.create(body);
    
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: product
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 400 });
  }
}