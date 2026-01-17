# 2FA Code Generator

Web lấy mã 2FA cho khách hàng.

## Cài đặt local

```bash
npm install
npm start
```

- Trang khách: http://localhost:3000
- Trang admin: http://localhost:3000/admin.html

## Deploy Railway

1. Push code lên GitHub
2. Vào [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Chọn repo này
4. Railway tự động deploy

## CSV Import Format

```csv
email,secret,note
example@gmail.com,JBSWY3DPEHPK3PXP,Ghi chú
```
