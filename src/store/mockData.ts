import { Product, Category, Store, Zone, Driver, Sale, Visit } from '../types';

export const mockCategories: Category[] = [
  { id: 1, name: 'เครื่องดื่ม' },
  { id: 2, name: 'ขนมขบเคี้ยว' },
  { id: 3, name: 'ของใช้ส่วนตัว' },
];

export const mockProducts: Product[] = [
  { id: 101, name: 'น้ำดื่ม 600ml', sku: 'DR-001', category_id: 1, price: 10 },
  { id: 102, name: 'น้ำอัดลม 325ml', sku: 'DR-002', category_id: 1, price: 15 },
  { id: 201, name: 'มันฝรั่งทอดกรอบ', sku: 'SN-001', category_id: 2, price: 20 },
  { id: 202, name: 'ถั่วลิสงอบเกลือ', sku: 'SN-002', category_id: 2, price: 10 },
  { id: 301, name: 'สบู่ก้อน', sku: 'PC-001', category_id: 3, price: 15 },
  { id: 302, name: 'ยาสีฟัน', sku: 'PC-002', category_id: 3, price: 35 },
];

// Mock Zones
export const mockProvinces: Zone[] = [
  { id: 1, name_th: 'นครราชสีมา' },
];

export const mockDistricts: Zone[] = [
  {
    'id': 1,
    'name_th': 'ขามทะเลสอ',
    'parent_id': 1
  },
  {
    'id': 2,
    'name_th': 'ขามสะแกแสง',
    'parent_id': 1
  },
  {
    'id': 3,
    'name_th': 'คง',
    'parent_id': 1
  },
  {
    'id': 4,
    'name_th': 'ครบุรี',
    'parent_id': 1
  },
  {
    'id': 5,
    'name_th': 'จักราช',
    'parent_id': 1
  },
  {
    'id': 6,
    'name_th': 'ชุมพวง',
    'parent_id': 1
  },
  {
    'id': 7,
    'name_th': 'ด่านขุนทด',
    'parent_id': 1
  },
  {
    'id': 8,
    'name_th': 'บัวลาย',
    'parent_id': 1
  },
  {
    'id': 9,
    'name_th': 'บัวใหญ่',
    'parent_id': 1
  },
  {
    'id': 10,
    'name_th': 'บ้านเหลื่อม',
    'parent_id': 1
  },
  {
    'id': 11,
    'name_th': 'ประทาย',
    'parent_id': 1
  },
  {
    'id': 12,
    'name_th': 'ปักธงชัย',
    'parent_id': 1
  },
  {
    'id': 13,
    'name_th': 'ปากช่อง',
    'parent_id': 1
  },
  {
    'id': 14,
    'name_th': 'พระทองคำ',
    'parent_id': 1
  },
  {
    'id': 15,
    'name_th': 'พิมาย',
    'parent_id': 1
  },
  {
    'id': 16,
    'name_th': 'ลำทะเมนชัย',
    'parent_id': 1
  },
  {
    'id': 17,
    'name_th': 'วังน้ำเขียว',
    'parent_id': 1
  },
  {
    'id': 18,
    'name_th': 'สีคิ้ว',
    'parent_id': 1
  },
  {
    'id': 19,
    'name_th': 'สีดา',
    'parent_id': 1
  },
  {
    'id': 20,
    'name_th': 'สูงเนิน',
    'parent_id': 1
  },
  {
    'id': 21,
    'name_th': 'หนองบุญมาก',
    'parent_id': 1
  },
  {
    'id': 22,
    'name_th': 'ห้วยแถลง',
    'parent_id': 1
  },
  {
    'id': 23,
    'name_th': 'เฉลิมพระเกียรติ',
    'parent_id': 1
  },
  {
    'id': 24,
    'name_th': 'เทพารักษ์',
    'parent_id': 1
  },
  {
    'id': 25,
    'name_th': 'เมืองนครราชสีมา',
    'parent_id': 1
  },
  {
    'id': 26,
    'name_th': 'เมืองยาง',
    'parent_id': 1
  },
  {
    'id': 27,
    'name_th': 'เสิงสาง',
    'parent_id': 1
  },
  {
    'id': 28,
    'name_th': 'แก้งสนามนาง',
    'parent_id': 1
  },
  {
    'id': 29,
    'name_th': 'โชคชัย',
    'parent_id': 1
  },
  {
    'id': 30,
    'name_th': 'โนนสูง',
    'parent_id': 1
  },
  {
    'id': 31,
    'name_th': 'โนนแดง',
    'parent_id': 1
  },
  {
    'id': 32,
    'name_th': 'โนนไทย',
    'parent_id': 1
  }
];

export const mockSubDistricts: Zone[] = [
  {
    'id': 1,
    'name_th': 'ขามทะเลสอ',
    'parent_id': 1
  },
  {
    'id': 2,
    'name_th': 'บึงอ้อ',
    'parent_id': 1
  },
  {
    'id': 3,
    'name_th': 'พันดุง',
    'parent_id': 1
  },
  {
    'id': 4,
    'name_th': 'หนองสรวง',
    'parent_id': 1
  },
  {
    'id': 5,
    'name_th': 'โป่งแดง',
    'parent_id': 1
  },
  {
    'id': 6,
    'name_th': 'ขามสะแกแสง',
    'parent_id': 2
  },
  {
    'id': 7,
    'name_th': 'ชีวึก',
    'parent_id': 2
  },
  {
    'id': 8,
    'name_th': 'พะงาด',
    'parent_id': 2
  },
  {
    'id': 9,
    'name_th': 'หนองหัวฟาน',
    'parent_id': 2
  },
  {
    'id': 10,
    'name_th': 'เมืองนาท',
    'parent_id': 2
  },
  {
    'id': 11,
    'name_th': 'เมืองเกษตร',
    'parent_id': 2
  },
  {
    'id': 12,
    'name_th': 'โนนเมือง',
    'parent_id': 2
  },
  {
    'id': 13,
    'name_th': 'ขามสมบูรณ์',
    'parent_id': 3
  },
  {
    'id': 14,
    'name_th': 'คูขาด',
    'parent_id': 3
  },
  {
    'id': 15,
    'name_th': 'ดอนใหญ่',
    'parent_id': 3
  },
  {
    'id': 16,
    'name_th': 'ตาจั่น',
    'parent_id': 3
  },
  {
    'id': 17,
    'name_th': 'บ้านปรางค์',
    'parent_id': 3
  },
  {
    'id': 18,
    'name_th': 'หนองบัว',
    'parent_id': 3
  },
  {
    'id': 19,
    'name_th': 'หนองมะนาว',
    'parent_id': 3
  },
  {
    'id': 20,
    'name_th': 'เทพาลัย',
    'parent_id': 3
  },
  {
    'id': 21,
    'name_th': 'เมืองคง',
    'parent_id': 3
  },
  {
    'id': 22,
    'name_th': 'โนนเต็ง',
    'parent_id': 3
  },
  {
    'id': 23,
    'name_th': 'ครบุรี',
    'parent_id': 4
  },
  {
    'id': 24,
    'name_th': 'ครบุรีใต้',
    'parent_id': 4
  },
  {
    'id': 25,
    'name_th': 'จระเข้หิน',
    'parent_id': 4
  },
  {
    'id': 26,
    'name_th': 'ตะแบกบาน',
    'parent_id': 4
  },
  {
    'id': 27,
    'name_th': 'บ้านใหม่',
    'parent_id': 4
  },
  {
    'id': 28,
    'name_th': 'มาบตะโกเอน',
    'parent_id': 4
  },
  {
    'id': 29,
    'name_th': 'ลำเพียก',
    'parent_id': 4
  },
  {
    'id': 30,
    'name_th': 'สระว่านพระยา',
    'parent_id': 4
  },
  {
    'id': 31,
    'name_th': 'อรพิมพ์',
    'parent_id': 4
  },
  {
    'id': 32,
    'name_th': 'เฉลียง',
    'parent_id': 4
  },
  {
    'id': 33,
    'name_th': 'แชะ',
    'parent_id': 4
  },
  {
    'id': 34,
    'name_th': 'โคกกระชาย',
    'parent_id': 4
  },
  {
    'id': 35,
    'name_th': 'คลองเมือง',
    'parent_id': 5
  },
  {
    'id': 36,
    'name_th': 'จักราช',
    'parent_id': 5
  },
  {
    'id': 37,
    'name_th': 'ทองหลาง',
    'parent_id': 5
  },
  {
    'id': 38,
    'name_th': 'ศรีละกอ',
    'parent_id': 5
  },
  {
    'id': 39,
    'name_th': 'สีสุก',
    'parent_id': 5
  },
  {
    'id': 40,
    'name_th': 'หนองขาม',
    'parent_id': 5
  },
  {
    'id': 41,
    'name_th': 'หนองพลวง',
    'parent_id': 5
  },
  {
    'id': 42,
    'name_th': 'หินโคน',
    'parent_id': 5
  },
  {
    'id': 43,
    'name_th': 'ชุมพวง',
    'parent_id': 6
  },
  {
    'id': 44,
    'name_th': 'ตลาดไทร',
    'parent_id': 6
  },
  {
    'id': 45,
    'name_th': 'ท่าลาด',
    'parent_id': 6
  },
  {
    'id': 46,
    'name_th': 'ประสุข',
    'parent_id': 6
  },
  {
    'id': 47,
    'name_th': 'สาหร่าย',
    'parent_id': 6
  },
  {
    'id': 48,
    'name_th': 'หนองหลัก',
    'parent_id': 6
  },
  {
    'id': 49,
    'name_th': 'โนนตูม',
    'parent_id': 6
  },
  {
    'id': 50,
    'name_th': 'โนนยอ',
    'parent_id': 6
  },
  {
    'id': 51,
    'name_th': 'โนนรัง',
    'parent_id': 6
  },
  {
    'id': 52,
    'name_th': 'กุดพิมาน',
    'parent_id': 7
  },
  {
    'id': 53,
    'name_th': 'ด่านขุนทด',
    'parent_id': 7
  },
  {
    'id': 54,
    'name_th': 'ด่านนอก',
    'parent_id': 7
  },
  {
    'id': 55,
    'name_th': 'ด่านใน',
    'parent_id': 7
  },
  {
    'id': 56,
    'name_th': 'ตะเคียน',
    'parent_id': 7
  },
  {
    'id': 57,
    'name_th': 'บ้านเก่า',
    'parent_id': 7
  },
  {
    'id': 58,
    'name_th': 'บ้านแปรง',
    'parent_id': 7
  },
  {
    'id': 59,
    'name_th': 'พันชนะ',
    'parent_id': 7
  },
  {
    'id': 60,
    'name_th': 'สระจรเข้',
    'parent_id': 7
  },
  {
    'id': 61,
    'name_th': 'หนองกราด',
    'parent_id': 7
  },
  {
    'id': 62,
    'name_th': 'หนองบัวตะเกียด',
    'parent_id': 7
  },
  {
    'id': 63,
    'name_th': 'หนองบัวละคร',
    'parent_id': 7
  },
  {
    'id': 64,
    'name_th': 'หนองไทร',
    'parent_id': 7
  },
  {
    'id': 65,
    'name_th': 'หินดาด',
    'parent_id': 7
  },
  {
    'id': 66,
    'name_th': 'ห้วยบง',
    'parent_id': 7
  },
  {
    'id': 67,
    'name_th': 'โนนเมืองพัฒนา',
    'parent_id': 7
  },
  {
    'id': 68,
    'name_th': 'บัวลาย',
    'parent_id': 8
  },
  {
    'id': 69,
    'name_th': 'หนองหว้า',
    'parent_id': 8
  },
  {
    'id': 70,
    'name_th': 'เมืองพะไล',
    'parent_id': 8
  },
  {
    'id': 71,
    'name_th': 'โนนจาน',
    'parent_id': 8
  },
  {
    'id': 72,
    'name_th': 'กุดจอก',
    'parent_id': 9
  },
  {
    'id': 73,
    'name_th': 'ขุนทอง',
    'parent_id': 9
  },
  {
    'id': 74,
    'name_th': 'ดอนตะหนิน',
    'parent_id': 9
  },
  {
    'id': 75,
    'name_th': 'ด่านช้าง',
    'parent_id': 9
  },
  {
    'id': 76,
    'name_th': 'บัวใหญ่',
    'parent_id': 9
  },
  {
    'id': 77,
    'name_th': 'หนองบัวสะอาด',
    'parent_id': 9
  },
  {
    'id': 78,
    'name_th': 'หนองแจ้งใหญ่',
    'parent_id': 9
  },
  {
    'id': 79,
    'name_th': 'ห้วยยาง',
    'parent_id': 9
  },
  {
    'id': 80,
    'name_th': 'เสมาใหญ่',
    'parent_id': 9
  },
  {
    'id': 81,
    'name_th': 'โนนทองหลาง',
    'parent_id': 9
  },
  {
    'id': 82,
    'name_th': 'ช่อระกา',
    'parent_id': 10
  },
  {
    'id': 83,
    'name_th': 'บ้านเหลื่อม',
    'parent_id': 10
  },
  {
    'id': 84,
    'name_th': 'วังโพธิ์',
    'parent_id': 10
  },
  {
    'id': 85,
    'name_th': 'โคกกระเบื้อง',
    'parent_id': 10
  },
  {
    'id': 86,
    'name_th': 'กระทุ่มราย',
    'parent_id': 11
  },
  {
    'id': 87,
    'name_th': 'ดอนมัน',
    'parent_id': 11
  },
  {
    'id': 88,
    'name_th': 'ตลาดไทร',
    'parent_id': 11
  },
  {
    'id': 89,
    'name_th': 'ทุ่งสว่าง',
    'parent_id': 11
  },
  {
    'id': 90,
    'name_th': 'นางรำ',
    'parent_id': 11
  },
  {
    'id': 91,
    'name_th': 'ประทาย',
    'parent_id': 11
  },
  {
    'id': 92,
    'name_th': 'วังไม้แดง',
    'parent_id': 11
  },
  {
    'id': 93,
    'name_th': 'หนองค่าย',
    'parent_id': 11
  },
  {
    'id': 94,
    'name_th': 'หนองพลวง',
    'parent_id': 11
  },
  {
    'id': 95,
    'name_th': 'หันห้วยทราย',
    'parent_id': 11
  },
  {
    'id': 96,
    'name_th': 'เมืองโดน',
    'parent_id': 11
  },
  {
    'id': 97,
    'name_th': 'โคกกลาง',
    'parent_id': 11
  },
  {
    'id': 98,
    'name_th': 'โนนเพ็ด',
    'parent_id': 11
  },
  {
    'id': 99,
    'name_th': 'งิ้ว',
    'parent_id': 12
  },
  {
    'id': 100,
    'name_th': 'ดอน',
    'parent_id': 12
  },
  {
    'id': 101,
    'name_th': 'ตะขบ',
    'parent_id': 12
  },
  {
    'id': 102,
    'name_th': 'ตะคุ',
    'parent_id': 12
  },
  {
    'id': 103,
    'name_th': 'ตูม',
    'parent_id': 12
  },
  {
    'id': 104,
    'name_th': 'ธงชัยเหนือ',
    'parent_id': 12
  },
  {
    'id': 105,
    'name_th': 'นกออก',
    'parent_id': 12
  },
  {
    'id': 106,
    'name_th': 'บ่อปลาทอง',
    'parent_id': 12
  },
  {
    'id': 107,
    'name_th': 'ภูหลวง',
    'parent_id': 12
  },
  {
    'id': 108,
    'name_th': 'ลำนางแก้ว',
    'parent_id': 12
  },
  {
    'id': 109,
    'name_th': 'สะแกราช',
    'parent_id': 12
  },
  {
    'id': 110,
    'name_th': 'สำโรง',
    'parent_id': 12
  },
  {
    'id': 111,
    'name_th': 'สุขเกษม',
    'parent_id': 12
  },
  {
    'id': 112,
    'name_th': 'เกษมทรัพย์',
    'parent_id': 12
  },
  {
    'id': 113,
    'name_th': 'เมืองปัก',
    'parent_id': 12
  },
  {
    'id': 114,
    'name_th': 'โคกไทย',
    'parent_id': 12
  },
  {
    'id': 115,
    'name_th': 'กลางดง',
    'parent_id': 13
  },
  {
    'id': 116,
    'name_th': 'ขนงพระ',
    'parent_id': 13
  },
  {
    'id': 117,
    'name_th': 'คลองม่วง',
    'parent_id': 13
  },
  {
    'id': 118,
    'name_th': 'จันทึก',
    'parent_id': 13
  },
  {
    'id': 119,
    'name_th': 'ปากช่อง',
    'parent_id': 13
  },
  {
    'id': 120,
    'name_th': 'พญาเย็น',
    'parent_id': 13
  },
  {
    'id': 121,
    'name_th': 'วังกะทะ',
    'parent_id': 13
  },
  {
    'id': 122,
    'name_th': 'วังไทร',
    'parent_id': 13
  },
  {
    'id': 123,
    'name_th': 'หนองน้ำแดง',
    'parent_id': 13
  },
  {
    'id': 124,
    'name_th': 'หนองสาหร่าย',
    'parent_id': 13
  },
  {
    'id': 125,
    'name_th': 'หมูสี',
    'parent_id': 13
  },
  {
    'id': 126,
    'name_th': 'โป่งตาลอง',
    'parent_id': 13
  },
  {
    'id': 127,
    'name_th': 'ทัพรั้ง',
    'parent_id': 14
  },
  {
    'id': 128,
    'name_th': 'พังเทียม',
    'parent_id': 14
  },
  {
    'id': 129,
    'name_th': 'มาบกราด',
    'parent_id': 14
  },
  {
    'id': 130,
    'name_th': 'สระพระ',
    'parent_id': 14
  },
  {
    'id': 131,
    'name_th': 'หนองหอย',
    'parent_id': 14
  },
  {
    'id': 132,
    'name_th': 'กระชอน',
    'parent_id': 15
  },
  {
    'id': 133,
    'name_th': 'กระเบื้องใหญ่',
    'parent_id': 15
  },
  {
    'id': 134,
    'name_th': 'ชีวาน',
    'parent_id': 15
  },
  {
    'id': 135,
    'name_th': 'ดงใหญ่',
    'parent_id': 15
  },
  {
    'id': 136,
    'name_th': 'ท่าหลวง',
    'parent_id': 15
  },
  {
    'id': 137,
    'name_th': 'ธารละหลอด',
    'parent_id': 15
  },
  {
    'id': 138,
    'name_th': 'นิคมสร้างตนเอง',
    'parent_id': 15
  },
  {
    'id': 139,
    'name_th': 'รังกาใหญ่',
    'parent_id': 15
  },
  {
    'id': 140,
    'name_th': 'สัมฤทธิ์',
    'parent_id': 15
  },
  {
    'id': 141,
    'name_th': 'หนองระเวียง',
    'parent_id': 15
  },
  {
    'id': 142,
    'name_th': 'โบสถ์',
    'parent_id': 15
  },
  {
    'id': 143,
    'name_th': 'ในเมือง',
    'parent_id': 15
  },
  {
    'id': 144,
    'name_th': 'ขุย',
    'parent_id': 16
  },
  {
    'id': 145,
    'name_th': 'ช่องแมว',
    'parent_id': 16
  },
  {
    'id': 146,
    'name_th': 'บ้านยาง',
    'parent_id': 16
  },
  {
    'id': 147,
    'name_th': 'ไพล',
    'parent_id': 16
  },
  {
    'id': 148,
    'name_th': 'ระเริง',
    'parent_id': 17
  },
  {
    'id': 149,
    'name_th': 'วังน้ำเขียว',
    'parent_id': 17
  },
  {
    'id': 150,
    'name_th': 'วังหมี',
    'parent_id': 17
  },
  {
    'id': 151,
    'name_th': 'อุดมทรัพย์',
    'parent_id': 17
  },
  {
    'id': 152,
    'name_th': 'ไทยสามัคคี',
    'parent_id': 17
  },
  {
    'id': 153,
    'name_th': 'กฤษณา',
    'parent_id': 18
  },
  {
    'id': 154,
    'name_th': 'กุดน้อย',
    'parent_id': 18
  },
  {
    'id': 155,
    'name_th': 'คลองไผ่',
    'parent_id': 18
  },
  {
    'id': 156,
    'name_th': 'ดอนเมือง',
    'parent_id': 18
  },
  {
    'id': 157,
    'name_th': 'บ้านหัน',
    'parent_id': 18
  },
  {
    'id': 158,
    'name_th': 'มิตรภาพ',
    'parent_id': 18
  },
  {
    'id': 159,
    'name_th': 'ลาดบัวขาว',
    'parent_id': 18
  },
  {
    'id': 160,
    'name_th': 'วังโรงใหญ่',
    'parent_id': 18
  },
  {
    'id': 161,
    'name_th': 'สีคิ้ว',
    'parent_id': 18
  },
  {
    'id': 162,
    'name_th': 'หนองน้ำใส',
    'parent_id': 18
  },
  {
    'id': 163,
    'name_th': 'หนองบัวน้อย',
    'parent_id': 18
  },
  {
    'id': 164,
    'name_th': 'หนองหญ้าขาว',
    'parent_id': 18
  },
  {
    'id': 165,
    'name_th': 'สามเมือง',
    'parent_id': 19
  },
  {
    'id': 166,
    'name_th': 'สีดา',
    'parent_id': 19
  },
  {
    'id': 167,
    'name_th': 'หนองตาดใหญ่',
    'parent_id': 19
  },
  {
    'id': 168,
    'name_th': 'โนนประดู่',
    'parent_id': 19
  },
  {
    'id': 169,
    'name_th': 'โพนทอง',
    'parent_id': 19
  },
  {
    'id': 170,
    'name_th': 'กุดจิก',
    'parent_id': 20
  },
  {
    'id': 171,
    'name_th': 'นากลาง',
    'parent_id': 20
  },
  {
    'id': 172,
    'name_th': 'บุ่งขี้เหล็ก',
    'parent_id': 20
  },
  {
    'id': 173,
    'name_th': 'มะเกลือเก่า',
    'parent_id': 20
  },
  {
    'id': 174,
    'name_th': 'มะเกลือใหม่',
    'parent_id': 20
  },
  {
    'id': 175,
    'name_th': 'สูงเนิน',
    'parent_id': 20
  },
  {
    'id': 176,
    'name_th': 'หนองตะไก้',
    'parent_id': 20
  },
  {
    'id': 177,
    'name_th': 'เสมา',
    'parent_id': 20
  },
  {
    'id': 178,
    'name_th': 'โคราช',
    'parent_id': 20
  },
  {
    'id': 179,
    'name_th': 'โค้งยาง',
    'parent_id': 20
  },
  {
    'id': 180,
    'name_th': 'โนนค่า',
    'parent_id': 20
  },
  {
    'id': 181,
    'name_th': 'บ้านใหม่',
    'parent_id': 21
  },
  {
    'id': 182,
    'name_th': 'ลุงเขว้า',
    'parent_id': 21
  },
  {
    'id': 183,
    'name_th': 'สารภี',
    'parent_id': 21
  },
  {
    'id': 184,
    'name_th': 'หนองตะไก้',
    'parent_id': 21
  },
  {
    'id': 185,
    'name_th': 'หนอ���บุนนาก',
    'parent_id': 21
  },
  {
    'id': 186,
    'name_th': 'หนองหัวแรต',
    'parent_id': 21
  },
  {
    'id': 187,
    'name_th': 'หนองไม้ไผ่',
    'parent_id': 21
  },
  {
    'id': 188,
    'name_th': 'แหลมทอง',
    'parent_id': 21
  },
  {
    'id': 189,
    'name_th': 'ไทยเจริญ',
    'parent_id': 21
  },
  {
    'id': 190,
    'name_th': 'กงรถ',
    'parent_id': 22
  },
  {
    'id': 191,
    'name_th': 'งิ้ว',
    'parent_id': 22
  },
  {
    'id': 192,
    'name_th': 'ตะโก',
    'parent_id': 22
  },
  {
    'id': 193,
    'name_th': 'ทับสวาย',
    'parent_id': 22
  },
  {
    'id': 194,
    'name_th': 'หลุ่งตะเคียน',
    'parent_id': 22
  },
  {
    'id': 195,
    'name_th': 'หลุ่งประดู่',
    'parent_id': 22
  },
  {
    'id': 196,
    'name_th': 'หินดาด',
    'parent_id': 22
  },
  {
    'id': 197,
    'name_th': 'ห้วยแคน',
    'parent_id': 22
  },
  {
    'id': 198,
    'name_th': 'ห้วยแถลง',
    'parent_id': 22
  },
  {
    'id': 199,
    'name_th': 'เมืองพลับพลา',
    'parent_id': 22
  },
  {
    'id': 200,
    'name_th': 'ช้างทอง',
    'parent_id': 23
  },
  {
    'id': 201,
    'name_th': 'ท่าช้าง',
    'parent_id': 23
  },
  {
    'id': 202,
    'name_th': 'พระพุทธ',
    'parent_id': 23
  },
  {
    'id': 203,
    'name_th': 'หนองงูเหลือม',
    'parent_id': 23
  },
  {
    'id': 204,
    'name_th': 'หนองยาง',
    'parent_id': 23
  },
  {
    'id': 205,
    'name_th': 'บึงปรือ',
    'parent_id': 24
  },
  {
    'id': 206,
    'name_th': 'วังยายทอง',
    'parent_id': 24
  },
  {
    'id': 207,
    'name_th': 'สำนักตะคร้อ',
    'parent_id': 24
  },
  {
    'id': 208,
    'name_th': 'หนองแวง',
    'parent_id': 24
  },
  {
    'id': 209,
    'name_th': 'จอหอ',
    'parent_id': 25
  },
  {
    'id': 210,
    'name_th': 'ตลาด',
    'parent_id': 25
  },
  {
    'id': 211,
    'name_th': 'บ้านเกาะ',
    'parent_id': 25
  },
  {
    'id': 212,
    'name_th': 'บ้านโพธิ์',
    'parent_id': 25
  },
  {
    'id': 213,
    'name_th': 'บ้านใหม่',
    'parent_id': 25
  },
  {
    'id': 214,
    'name_th': 'ปรุใหญ่',
    'parent_id': 25
  },
  {
    'id': 215,
    'name_th': 'พลกรัง',
    'parent_id': 25
  },
  {
    'id': 216,
    'name_th': 'พะเนา',
    'parent_id': 25
  },
  {
    'id': 217,
    'name_th': 'พุดซา',
    'parent_id': 25
  },
  {
    'id': 218,
    'name_th': 'มะเริง',
    'parent_id': 25
  },
  {
    'id': 219,
    'name_th': 'สีมุม',
    'parent_id': 25
  },
  {
    'id': 220,
    'name_th': 'สุรนารี',
    'parent_id': 25
  },
  {
    'id': 221,
    'name_th': 'หนองกระทุ่ม',
    'parent_id': 25
  },
  {
    'id': 222,
    'name_th': 'หนองจะบก',
    'parent_id': 25
  },
  {
    'id': 223,
    'name_th': 'หนองบัวศาลา',
    'parent_id': 25
  },
  {
    'id': 224,
    'name_th': 'หนองระเวียง',
    'parent_id': 25
  },
  {
    'id': 225,
    'name_th': 'หนองไข่น้ำ',
    'parent_id': 25
  },
  {
    'id': 226,
    'name_th': 'หนองไผ่ล้อม',
    'parent_id': 25
  },
  {
    'id': 227,
    'name_th': 'หมื่นไวย',
    'parent_id': 25
  },
  {
    'id': 228,
    'name_th': 'หัวทะเล',
    'parent_id': 25
  },
  {
    'id': 229,
    'name_th': 'โคกกรวด',
    'parent_id': 25
  },
  {
    'id': 230,
    'name_th': 'โคกสูง',
    'parent_id': 25
  },
  {
    'id': 231,
    'name_th': 'โพธิ์กลาง',
    'parent_id': 25
  },
  {
    'id': 232,
    'name_th': 'ในเมือง',
    'parent_id': 25
  },
  {
    'id': 233,
    'name_th': 'ไชยมงคล',
    'parent_id': 25
  },
  {
    'id': 234,
    'name_th': 'กระเบื้องนอก',
    'parent_id': 26
  },
  {
    'id': 235,
    'name_th': 'ละหานปลาค้าว',
    'parent_id': 26
  },
  {
    'id': 236,
    'name_th': 'เมืองยาง',
    'parent_id': 26
  },
  {
    'id': 237,
    'name_th': 'โนนอุดม',
    'parent_id': 26
  },
  {
    'id': 238,
    'name_th': 'กุดโบสถ์',
    'parent_id': 27
  },
  {
    'id': 239,
    'name_th': 'บ้านราษฎร์',
    'parent_id': 27
  },
  {
    'id': 240,
    'name_th': 'สระตะเคียน',
    'parent_id': 27
  },
  {
    'id': 241,
    'name_th': 'สุขไพบูลย์',
    'parent_id': 27
  },
  {
    'id': 242,
    'name_th': 'เสิงสาง',
    'parent_id': 27
  },
  {
    'id': 243,
    'name_th': 'โนนสมบูรณ์',
    'parent_id': 27
  },
  {
    'id': 244,
    'name_th': 'บึงพะไล',
    'parent_id': 28
  },
  {
    'id': 245,
    'name_th': 'บึงสำโรง',
    'parent_id': 28
  },
  {
    'id': 246,
    'name_th': 'สีสุก',
    'parent_id': 28
  },
  {
    'id': 247,
    'name_th': 'แก้งสนามนาง',
    'parent_id': 28
  },
  {
    'id': 248,
    'name_th': 'โนนสำราญ',
    'parent_id': 28
  },
  {
    'id': 249,
    'name_th': 'กระโทก',
    'parent_id': 29
  },
  {
    'id': 250,
    'name_th': 'ด่านเกวียน',
    'parent_id': 29
  },
  {
    'id': 251,
    'name_th': 'ทุ่งอรุณ',
    'parent_id': 29
  },
  {
    'id': 252,
    'name_th': 'ท่าจะหลุง',
    'parent_id': 29
  },
  {
    'id': 253,
    'name_th': 'ท่าลาดขาว',
    'parent_id': 29
  },
  {
    'id': 254,
    'name_th': 'ท่าอ่าง',
    'parent_id': 29
  },
  {
    'id': 255,
    'name_th': 'ท่าเยี่ยม',
    'parent_id': 29
  },
  {
    'id': 256,
    'name_th': 'พลับพลา',
    'parent_id': 29
  },
  {
    'id': 257,
    'name_th': 'ละลมใหม่พัฒนา',
    'parent_id': 29
  },
  {
    'id': 258,
    'name_th': 'โชคชัย',
    'parent_id': 29
  },
  {
    'id': 259,
    'name_th': 'ขามเฒ่า',
    'parent_id': 30
  },
  {
    'id': 260,
    'name_th': 'จันอัด',
    'parent_id': 30
  },
  {
    'id': 261,
    'name_th': 'ดอนชมพู',
    'parent_id': 30
  },
  {
    'id': 262,
    'name_th': 'ดอนหวาย',
    'parent_id': 30
  },
  {
    'id': 263,
    'name_th': 'ด่านคล้า',
    'parent_id': 30
  },
  {
    'id': 264,
    'name_th': 'ธารปราสาท',
    'parent_id': 30
  },
  {
    'id': 265,
    'name_th': 'บิง',
    'parent_id': 30
  },
  {
    'id': 266,
    'name_th': 'พลสงคราม',
    'parent_id': 30
  },
  {
    'id': 267,
    'name_th': 'มะค่า',
    'parent_id': 30
  },
  {
    'id': 268,
    'name_th': 'ลำคอหงษ์',
    'parent_id': 30
  },
  {
    'id': 269,
    'name_th': 'ลำมูล',
    'parent_id': 30
  },
  {
    'id': 270,
    'name_th': 'หลุมข้าว',
    'parent_id': 30
  },
  {
    'id': 271,
    'name_th': 'เมืองปราสาท',
    'parent_id': 30
  },
  {
    'id': 272,
    'name_th': 'โตนด',
    'parent_id': 30
  },
  {
    'id': 273,
    'name_th': 'โนนสูง',
    'parent_id': 30
  },
  {
    'id': 274,
    'name_th': 'ใหม่',
    'parent_id': 30
  },
  {
    'id': 275,
    'name_th': 'ดอนยาวใหญ่',
    'parent_id': 31
  },
  {
    'id': 276,
    'name_th': 'วังหิน',
    'parent_id': 31
  },
  {
    'id': 277,
    'name_th': 'สำพะเนียง',
    'parent_id': 31
  },
  {
    'id': 278,
    'name_th': 'โนนตาเถร',
    'parent_id': 31
  },
  {
    'id': 279,
    'name_th': 'โนนแดง',
    'parent_id': 31
  },
  {
    'id': 280,
    'name_th': 'กำปัง',
    'parent_id': 32
  },
  {
    'id': 281,
    'name_th': 'ค้างพลู',
    'parent_id': 32
  },
  {
    'id': 282,
    'name_th': 'ด่านจาก',
    'parent_id': 32
  },
  {
    'id': 283,
    'name_th': 'ถนนโพธิ์',
    'parent_id': 32
  },
  {
    'id': 284,
    'name_th': 'บัลลังก์',
    'parent_id': 32
  },
  {
    'id': 285,
    'name_th': 'บ้านวัง',
    'parent_id': 32
  },
  {
    'id': 286,
    'name_th': 'มะค่า',
    'parent_id': 32
  },
  {
    'id': 287,
    'name_th': 'สายออ',
    'parent_id': 32
  },
  {
    'id': 288,
    'name_th': 'สำโรง',
    'parent_id': 32
  },
  {
    'id': 289,
    'name_th': 'โนนไทย',
    'parent_id': 32
  }
];

// Predefined distinct colors for each District map visualization
export const districtColors: Record<number, string> = {
  25: '#3b82f6', // เมืองนครราชสีมา - Blue
  13: '#ef4444', // ปากช่อง - Red
  12: '#eab308', // ปักธงชัย - Yellow
  18: '#22c55e', // สีคิ้ว - Green
  15: '#a855f7', // พิมาย - Purple
  4: '#ec4899',  // ครบุรี - Pink
  1: '#14b8a6',  // ขามทะเลสอ - Teal
  7: '#f97316',  // ด่านขุนทด - Orange
  2: '#6366f1',  // ขามสะแกแสง - Indigo
  3: '#8b5cf6',  // คง - Violet
  5: '#f43f5e',  // จักราช - Rose
  6: '#10b981',  // ชุมพวง - Emerald
  29: '#fbbf24', // โชคชัย - Amber
  30: '#0ea5e9', // โนนสูง - Sky
};

// Store Type Colors for Pins
export const storeTypeColors: Record<string, string> = {
  grocery: '#3b82f6', // Blue
  minimart: '#f59e0b', // Orange (Amber)
  supermarket: '#10b981', // Green
  restaurant: '#ef4444', // Red
  stall: '#a855f7', // Purple
  default: '#64748b', // Slate
};

// Mock Drivers
export const mockDrivers: Driver[] = [
  { id: 'd1', name: 'Satit', vehicle_plate: '1กข-1234', vehicle_code: 'VAN-01', phone: '081-234-5678', work_status: 'ONLINE', assigned_zone: 'เมือง - โซน 1' },
  { id: 'd2', name: 'Sompong', vehicle_plate: '2ขค-5678', vehicle_code: 'VAN-02', phone: '089-876-5432', work_status: 'OFFLINE', assigned_zone: 'โซนเขาใหญ่' },
];

// Initial Stores spanning various districts in Korat
export const initialStores: Store[] = [
  // Muang Nakhon Ratchasima (25)
  {
    id: 's1',
    name: 'ร้านโชห่วย ย่าโม',
    address: '123 ซอยมิตรภาพ 4 ในเมือง',
    additional_info: 'ใกล้ลานย่าโม',
    lat: 14.9736,
    lng: 102.0945,
    type: 'grocery',
    sub_district_id: 232, // ในเมือง
    interested_products: [{ product_id: 101, interest_type: 'buy' }, { product_id: 201, interest_type: 'sell' }],
    created_at: new Date(Date.now() - 10000000).toISOString(),
    created_by: 'สมชาย ขยันขาย',
    status: 'SUCCESS',
    sales_zone: 'เมือง - โซน 1'
  },
  {
    id: 's2',
    name: 'โคราช มินิมาร์ท',
    address: '45/2 ถนนโพธิ์กลาง',
    additional_info: 'ตรงข้ามโรงเรียนสาธิต',
    lat: 14.9799,
    lng: 102.0978,
    type: 'minimart',
    sub_district_id: 231, // โพธิ์กลาง
    interested_products: [{ product_id: 102, interest_type: 'buy' }, { product_id: 302, interest_type: 'buy' }],
    created_at: new Date(Date.now() - 20000000).toISOString(),
    created_by: 'สมหญิง จริงใจ',
    status: 'SUCCESS',
    sales_zone: 'เมือง - โซน 1'
  },
  {
    id: 's3',
    name: 'สุรนารี ซุปเปอร์',
    address: '88 มหาวิทยาลัยเทคโนโลยีสุรนารี',
    additional_info: 'ประตู 1',
    lat: 14.8718,
    lng: 102.0229,
    type: 'supermarket',
    sub_district_id: 220, // สุรนารี
    interested_products: [{ product_id: 201, interest_type: 'sell' }, { product_id: 301, interest_type: 'buy' }],
    created_at: new Date(Date.now() - 30000000).toISOString(),
    created_by: 'วิชัย เดินรถ',
    status: 'UNSURVEYED',
    sales_zone: 'โซนอุตสาหกรรม'
  },
  
  // Pak Chong (13)
  {
    id: 's4',
    name: 'มินิมาร์ท ปากช่อง',
    address: '99 ถนนมิตรภาพสายเก่า',
    additional_info: 'ทางเข้าเขาใหญ่',
    lat: 14.7001,
    lng: 101.4116,
    type: 'minimart',
    sub_district_id: 119, // ปากช่อง
    interested_products: [{ product_id: 101, interest_type: 'buy' }],
    created_at: new Date(Date.now() - 40000000).toISOString(),
    created_by: 'สมชาย ขยันขาย',
    status: 'SUCCESS',
    sales_zone: 'โซนเขาใหญ่'
  },
  {
    id: 's5',
    name: 'โชห่วย กลางดง',
    address: '15/1 หมู่ 3 กลางดง',
    lat: 14.6335,
    lng: 101.2721,
    type: 'grocery',
    sub_district_id: 115, // กลางดง
    interested_products: [{ product_id: 202, interest_type: 'sell' }],
    created_at: new Date(Date.now() - 50000000).toISOString(),
    created_by: 'สมหญิง จริงใจ',
    status: 'UNSURVEYED',
    sales_zone: 'โซนเขาใหญ่'
  },

  // Pak Thong Chai (12)
  {
    id: 's6',
    name: 'ปักธงชัย สโตร์',
    address: '112/5 ถนน 304',
    additional_info: 'ตลาดสดปักธงชัย',
    lat: 14.7171,
    lng: 102.0211,
    type: 'grocery',
    sub_district_id: 113, // เมืองปัก
    interested_products: [{ product_id: 302, interest_type: 'buy' }],
    created_at: new Date(Date.now() - 60000000).toISOString(),
    created_by: 'วิชัย เดินรถ',
    status: 'SUCCESS',
    sales_zone: 'โซนใต้'
  },

  // Sikhiu (18)
  {
    id: 's7',
    name: 'สีคิ้ว ซุปเปอร์มาร์ท',
    address: '77 ถนนมิตรภาพ สีคิ้ว',
    lat: 14.8878,
    lng: 101.7161,
    type: 'supermarket',
    sub_district_id: 161, // สีคิ้ว
    interested_products: [{ product_id: 102, interest_type: 'sell' }, { product_id: 202, interest_type: 'buy' }],
    created_at: new Date(Date.now() - 70000000).toISOString(),
    created_by: 'สมศักดิ์ รักดี',
    status: 'UNSURVEYED',
    sales_zone: 'โซนเหนือ'
  },

  // Phimai (15)
  {
    id: 's8',
    name: 'พิมาย มินิมาร์ท',
    address: '99/9 ใกล้อุทยานประวัติศาสตร์พิมาย',
    lat: 15.2208,
    lng: 102.4938,
    type: 'minimart',
    sub_district_id: 143, // ในเมือง (พิมาย)
    interested_products: [{ product_id: 101, interest_type: 'buy' }],
    created_at: new Date(Date.now() - 80000000).toISOString(),
    created_by: 'สมหมาย ชายชาตรี',
    status: 'SUCCESS',
    sales_zone: 'โซนอีสาน'
  },

  // Khon Buri (4)
  {
    id: 's9',
    name: 'โชห่วย จระเข้หิน',
    address: '65 หมู่ 2, ครบุรี',
    lat: 14.4746,
    lng: 102.1620,
    type: 'grocery',
    sub_district_id: 25, // จระเข้หิน
    interested_products: [{ product_id: 301, interest_type: 'buy' }],
    created_at: new Date(Date.now() - 90000000).toISOString(),
    created_by: 'สมชาย ขยันขาย',
    status: 'UNSURVEYED',
    sales_zone: 'โซนใต้'
  },
  
  // Dan Khun Thot (7)
  {
    id: 's10',
    name: 'ด่านขุนทด สะดวกซื้อ',
    address: '43 ถนนสีคิ้ว-ชัยภูมิ',
    lat: 15.2078,
    lng: 101.7645,
    type: 'minimart',
    sub_district_id: 53, // ด่านขุนทด
    interested_products: [{ product_id: 201, interest_type: 'sell' }],
    created_at: new Date(Date.now() - 100000000).toISOString(),
    status: 'SUCCESS',
    sales_zone: 'โซนเหนือ'
  },
  // --- OSM IMPORTED PROSPECTS ---
  {
    "id": "osm-418689617",
    "name": "7-Eleven",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9897069,
    "lng": 102.1173229,
    "type": "minimart",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-423735635",
    "name": "ร้านค้าทั่วไป (OSM)",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 15.0595489,
    "lng": 102.124322,
    "type": "convenience",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-476142104",
    "name": "7-Eleven (สาขาในเมือง)",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9713345,
    "lng": 102.063474,
    "type": "minimart",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-476722883",
    "name": "FamilyMart",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9734994,
    "lng": 102.0833912,
    "type": "minimart",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-756182181",
    "name": "7-Eleven",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9818809,
    "lng": 102.0963366,
    "type": "minimart",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-764720199",
    "name": "ร้านโชห่วย (ตลาดประปา)",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9839352,
    "lng": 102.1009949,
    "type": "grocery",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-1051516246",
    "name": "7-Eleven",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9602418,
    "lng": 102.1022131,
    "type": "minimart",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-1051516298",
    "name": "7-Eleven",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9576404,
    "lng": 102.103233,
    "type": "minimart",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-1215712128",
    "name": "Mini Big C",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9607147,
    "lng": 102.1332837,
    "type": "minimart",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  },
  {
    "id": "osm-1234057635",
    "name": "7-Eleven",
    "address": "พิกัดจาก OSM",
    "additional_info": "สำรวจโดยพนักงาน",
    "lat": 14.9634969,
    "lng": 102.134322,
    "type": "minimart",
    "sub_district_id": 232,
    "interested_products": [],
    "created_at": "2026-04-07T04:06:07.462Z",
    "status": "PROSPECT",
    "sales_zone": "โซนสำรวจใหม่"
  }
];

export const mockSales: Sale[] = [
  {
    id: 'sale-1',
    store_id: 's1',
    driver_id: 'd1',
    total_amount: 1500,
    items: [
      { product_id: 101, quantity: 100, price: 10 },
      { product_id: 201, quantity: 25, price: 20 }
    ],
    created_at: new Date(Date.now() - 10000000).toISOString()
  },
  {
    id: 'sale-2',
    store_id: 's2',
    driver_id: 'd2',
    total_amount: 500,
    items: [
      { product_id: 301, quantity: 20, price: 15 },
      { product_id: 302, quantity: 5, price: 40 }
    ],
    created_at: new Date(Date.now() - 20000000).toISOString()
  }
];

export const mockInventories = {
  'd1': [
    { product_id: 101, quantity: 500 },
    { product_id: 102, quantity: 300 },
    { product_id: 201, quantity: 150 },
    { product_id: 202, quantity: 200 }
  ],
  'd2': [
    { product_id: 301, quantity: 100 },
    { product_id: 302, quantity: 80 }
  ]
};

export const mockVisits: Visit[] = [
  {
    id: 'v1',
    store_id: 's1',
    driver_id: 'd1',
    visited_at: new Date().toISOString(),
    notes: 'ร้านนี้ขายน้ำดื่มดีมาก',
    status: 'SUCCESS'
  },
  {
    id: 'v2',
    store_id: 's3',
    driver_id: 'd1',
    visited_at: new Date(Date.now() - 3600000).toISOString(),
    notes: 'เจ้าของร้านไม่อยู่',
    status: 'FAILED'
  }
];
