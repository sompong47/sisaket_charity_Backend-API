import os
import re

# แปลง Express routes เป็น Next.js API routes
def convert_route_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # แทนที่ require เป็น import
    content = re.sub(r"const express = require\('express'\);", "", content)
    content = re.sub(r"const router = express\.Router\(\);", "", content)
    content = re.sub(r"const (\w+) = require\('\.\./models/(\w+)'\);", 
                     r"import \1 from '@/lib/models/\2';", content)
    
    # เพิ่ม imports
    imports = """import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
"""
    
    # แปลง router.get เป็น export async function GET
    content = re.sub(r"router\.get\('/', async \(req, res\) => \{", 
                     "export async function GET(request) {\n  await connectDB();", content)
    
    # แปลง res.json เป็น NextResponse.json
    content = re.sub(r"res\.json\((.*?)\)", r"return NextResponse.json(\1)", content)
    content = re.sub(r"res\.status\((\d+)\)\.json\((.*?)\)", 
                     r"return NextResponse.json(\2, { status: \1 })", content)
    
    # ลบ module.exports
    content = re.sub(r"module\.exports = router;", "", content)
    
    # เขียนไฟล์ใหม่
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(imports + "\n" + content)
    
    print(f"✅ Converted: {input_path} -> {output_path}")

# รัน conversion
routes_dir = "src/routes"
output_dir = "nextjs-api"

for filename in os.listdir(routes_dir):
    if filename.endswith('.js'):
        input_path = os.path.join(routes_dir, filename)
        output_path = os.path.join(output_dir, filename.replace('.js', ''), 'route.js')
        convert_route_file(input_path, output_path)

print("\n🎉 Conversion completed!")