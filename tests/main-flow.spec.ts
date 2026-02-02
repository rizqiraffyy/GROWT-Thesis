import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  // Go to Main Page
  await page.goto('https://growt-farm.vercel.app/');
  // Halaman Sign Up
  await page.getByRole('link', { name: 'Daftar' }).click();
  await page.getByRole('textbox', { name: 'Nama lengkap' }).click();
  await page.getByRole('textbox', { name: 'Nama lengkap' }).fill('Main Simulation');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('main.simulation@growt.com');
  await page.getByRole('textbox', { name: 'Kata sandi', exact: true }).click();
  await page.getByRole('textbox', { name: 'Kata sandi', exact: true }).fill('password');
  await page.getByRole('textbox', { name: 'Konfirmasi kata sandi' }).click();
  await page.getByRole('textbox', { name: 'Konfirmasi kata sandi' }).fill('password');
  await page.getByRole('button', { name: 'Daftar' }).click();

  // Halaman Sign In
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('main.simulation@growt.com');
  await page.getByRole('textbox', { name: 'Kata sandi' }).click();
  await page.getByRole('textbox', { name: 'Kata sandi' }).fill('password');
  await page.getByRole('button', { name: 'Masuk' }).click();

  // Halaman Dashboard
  await page.goto('https://growt-farm.vercel.app/main/dashboard');
  await page.getByRole('main').getByRole('button', { name: 'Toggle Sidebar' }).click(); // Minimize Sidebar

  // Halaman Registrasi (Valiasi)
  await page.getByRole('button', { name: 'Registrasi' }).click();
  await page.getByRole('menuitem', { name: 'Perangkat' }).click();

  // Halaman Pengaturan Profil
  await page.getByRole('link', { name: 'Buka Pengaturan' }).click();
  await page.getByRole('textbox', { name: 'No. HP' }).click();
  await page.getByRole('textbox', { name: 'No. HP' }).fill('0812356789');
  await page.getByRole('textbox', { name: 'Tanggal lahir' }).fill('2002-02-02');
  await page.getByRole('combobox', { name: 'Jenis kelamin' }).click();
  await page.getByRole('option', { name: 'Laki-laki' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Simpan perubahan' }).first().click(); // Profile Settings

  await page.getByRole('combobox', { name: 'Provinsi' }).click();
  await page.getByRole('option', { name: 'DI YOGYAKARTA' }).click();
  await page.getByRole('combobox', { name: 'Kab/Kota' }).click();
  await page.getByLabel('KABUPATEN SLEMAN').getByText('KABUPATEN SLEMAN').click();
  await page.getByRole('combobox', { name: 'Kecamatan' }).click();
  await page.getByRole('option', { name: 'MLATI' }).click();
  await page.getByRole('combobox', { name: 'Desa/Kelurahan' }).click();
  await page.getByRole('option', { name: 'SINDUADI' }).click();
  await page.getByRole('textbox', { name: 'Jalan' }).click();
  await page.getByRole('textbox', { name: 'Jalan' }).fill('Jl. Sains');
  await page.getByRole('textbox', { name: 'Kode pos' }).click();
  await page.getByRole('textbox', { name: 'Kode pos' }).fill('55281');
  await page.getByRole('textbox', { name: 'Detail alamat' }).click();
  await page.getByRole('textbox', { name: 'Detail alamat' }).fill('Departemen Ilmu Komputer dan Elektronika, FMIPA UGM');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Simpan perubahan' }).nth(1).click(); // Address Settings

  // Halaman Registrasi Perangkat (Sukses)
  await page.getByRole('button', { name: 'Registrasi' }).click();
  await page.getByRole('menuitem', { name: 'Perangkat' }).click();
  await page.getByRole('textbox', { name: 'Nomor serial *' }).click();
  await page.getByRole('textbox', { name: 'Nomor serial *' }).fill('SN-1234');
  await page.getByRole('textbox', { name: 'Nama perangkat *' }).click();
  await page.getByRole('textbox', { name: 'Nama perangkat *' }).fill('Timbangan Simulasi');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Registrasikan perangkat' }).click();

  // Halaman Registrasi Ternak (Sukses)
  await page.getByRole('button', { name: 'Registrasi', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Ternak' }).click();
  await page.getByRole('textbox', { name: 'RFID *' }).click();
  await page.getByRole('textbox', { name: 'RFID *' }).fill('RF-1234');
  await page.getByRole('textbox', { name: 'Nama *' }).click();
  await page.getByRole('textbox', { name: 'Nama *' }).fill('Messi');
  await page.getByRole('textbox', { name: 'Ras *' }).click();
  await page.getByRole('textbox', { name: 'Ras *' }).fill('Texel');
  await page.getByRole('textbox', { name: 'Tanggal lahir *' }).fill('2020-02-02');
  await page.getByRole('combobox', { name: 'Spesies *' }).click();
  await page.getByRole('option', { name: 'Domba' }).click();
  await page.getByRole('combobox', { name: 'Kelamin *' }).click();
  await page.getByRole('option', { name: 'Jantan' }).click();
  await page.locator('label').filter({ hasText: 'Anthrax' }).click();
  await page.getByRole('checkbox', { name: 'Enterotoxemia' }).click();
  await page.getByRole('checkbox', { name: 'PMK' }).click();
  await page.getByText('Upload foto').click();
  await page.locator('body').setInputFiles('RF-1111.jpg');
  await page.getByRole('button', { name: 'Simpan foto' }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Simpan ternak' }).click();

  // Halaman Perangkat (Pending Device)
  await page.getByRole('link', { name: 'Perangkat' }).click();

  // Logout User
  await page.locator('#radix-_r_j_').click();
  await page.getByRole('menuitem', { name: 'Keluar' }).click();

  // Sign In Kembali sebagai Admin
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('admin@growt.com');
  await page.getByRole('textbox', { name: 'Kata sandi' }).click();
  await page.getByRole('textbox', { name: 'Kata sandi' }).fill('password');
  await page.getByRole('button', { name: 'Masuk' }).click();

  // Halaman Kontrol Admin
  await page.goto('https://growt-farm.vercel.app/main/kontrol');
  await page.getByRole('row', { name: 'Pilih baris Timbangan' }).getByRole('switch').click(); // Switch Activate Device
  await page.locator('#radix-_r_j_').click();
  await page.getByRole('menuitem', { name: 'Keluar' }).click(); // Logout Admin

  // Sign In Kembali sebagai User
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('main.simulation@growt.com');
  await page.getByRole('textbox', { name: 'Kata sandi' }).click();
  await page.getByRole('textbox', { name: 'Kata sandi' }).fill('password');
  await page.getByRole('button', { name: 'Masuk' }).click();

  // Halaman Utama Dashboard
  await page.goto('https://growt-farm.vercel.app/main/dashboard');
  await page.getByRole('main').getByRole('button', { name: 'Toggle Sidebar' }).click(); // Minimize Sidebar

  // Halaman Perangkat (Active Device)
  await page.getByRole('link', { name: 'Perangkat' }).click();

  // Halaman Data Log
  await page.getByRole('link', { name: 'Log Data' }).click();
  await page.goto('https://growt-farm.vercel.app/main/log-data');
  await page.getByRole('main').getByRole('button', { name: 'Toggle Sidebar' }).click();

  // Halaman Dashboard
  await page.getByRole('link', { name: 'Dashboard' }).click();
  await page.getByRole('main').getByRole('button', { name: 'Toggle Sidebar' }).click();
  await page.getByRole('switch').click();
  await page.getByRole('cell').filter({ hasText: /^$/ }).nth(3).click();
  await page.getByRole('row', { name: 'Select row Bima 63BE1504 Bima' }).getByLabel('Select row').click();

  // Halaman Detail
  await page.getByRole('menuitem', { name: 'Detail' }).click();
  await page.getByRole('checkbox', { name: 'Pilih semua' }).click();
  await page.getByRole('button', { name: 'Ekspor' }).click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('menuitem', { name: 'CSV (.csv)' }).click(),
  ]);

  // Halaman Publik
  await page.getByRole('link', { name: 'Publik' }).click();
  await page.locator('tr:nth-child(3) > td:nth-child(14)').click();
  await page.getByRole('menuitem', { name: 'Details' }).click();

  await page.locator('#radix-_r_j_').click();
  await page.getByRole('menuitem', { name: 'Keluar' }).click(); // Logout User


  // Syarat & Kebijakan
  await page.getByRole('navigation').getByRole('link', { name: 'Syarat Layanan' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Kebijakan Privasi' }).click();

  // Halaman Bantuan
  await page.getByRole('navigation').getByRole('link', { name: 'Pusat Bantuan' }).click();
  await page.getByRole('link', { name: 'Buka FAQ' }).click(); // FAQ
  await page.getByRole('link', { name: 'Baca Panduan' }).click(); // User Guide
  await page.getByRole('link', { name: 'Kontak' }).click(); // Contact Us

  // Masuk Akun Simulasi
  await page.getByRole('link', { name: 'Masuk akun simulasi' }).click();
  await page.locator('#radix-_r_7n_').click();
  await page.getByRole('button', { name: 'Keluar' }).click(); // Logout Simulated Account
});