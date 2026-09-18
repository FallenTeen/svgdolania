-- =====================================================================
-- supabase/seed.sql
-- Data dummy untuk development "Explore Curug Banyumas"
-- Dijalankan SETELAH migration 0001_init_schema.sql & 0002_rls_policies.sql
--
-- Catatan penting:
-- - Semua id memakai default kolom gen_random_uuid() (tidak di-set manual),
--   dan relasi antar tabel dijaga konsisten lewat CTE (WITH ... RETURNING)
--   yang saling mereferensikan dalam satu statement besar.
-- - Kolom participants.user_id sengaja dibiarkan NULL untuk semua baris,
--   termasuk yang is_guest = false. Supabase tidak merekomendasikan
--   INSERT langsung ke tabel auth.users lewat SQL biasa (butuh Admin API/
--   supabase.auth.admin.createUser); jadi flag is_guest di sini murni
--   sebagai variasi tampilan UI (badge Member/Guest), belum diikat ke user
--   asli. Kalau nanti perlu user asli untuk testing login, buat lewat
--   Supabase Studio (Authentication > Add user) lalu update baris ini.
-- =====================================================================

with new_curugs as (
  insert into public.curugs (
    name, alt_name, slug, short_description, long_description,
    village, district, latitude, longitude, google_maps_url,
    difficulty, trek_duration_minutes, distance_from_city_km,
    ticket_price, parking_price, best_time_to_visit,
    facilities, access_notes, tags,
    cover_image_url, gallery, is_published
  )
  values
  (
    'Curug Cipendok', null, 'curug-cipendok',
    'Air terjun setinggi ±92 meter di lereng Gunung Slamet, salah satu yang paling populer di Banyumas.',
    'Curug Cipendok terletak di kawasan hutan lindung lereng Gunung Slamet dengan udara sejuk sepanjang tahun. Selain air terjun utama, area ini juga punya spot foto, camping ground, dan jalur trekking ringan yang cocok untuk keluarga maupun rombongan.',
    'Karangtengah', 'Cilongok', -7.279500, 109.132200,
    'https://maps.google.com/?q=Curug+Cipendok+Cilongok+Banyumas',
    'mudah', 20, 25.0,
    15000, 5000, 'April - Oktober (musim kemarau, debit air stabil dan jalur tidak licin)',
    '["toilet","warung","mushola","gazebo","area_camping","tempat_parkir_luas"]'::jsonb,
    'Jalan aspal mulus sampai area parkir, dilanjutkan jalan setapak berundak ±15-20 menit. Aman untuk anak-anak dengan pengawasan.',
    '["pemula","keluarga","hobi_foto","dekat_kota","camping"]'::jsonb,
    'https://images.example.com/curug-cipendok/cover.jpg',
    '["https://images.example.com/curug-cipendok/1.jpg","https://images.example.com/curug-cipendok/2.jpg","https://images.example.com/curug-cipendok/3.jpg"]'::jsonb,
    true
  ),
  (
    'Curug Gomblang', 'Curug Jenggot', 'curug-gomblang',
    'Air terjun tersembunyi dengan kolam alami jernih, favorit untuk berenang dan cliff jumping ringan.',
    'Curug Gomblang berada di kawasan perbukitan dengan trek yang lebih menantang dibanding curug lain di Banyumas. Kolam di bawah air terjun cukup dalam dan jernih, sering dipakai untuk berenang. Cocok untuk yang suka petualangan ringan sampai menengah.',
    'Ketenger', 'Baturraden', -7.293800, 109.226100,
    'https://maps.google.com/?q=Curug+Gomblang+Baturraden+Banyumas',
    'menengah', 35, 18.5,
    10000, 5000, 'Mei - September (debit air aman untuk berenang, jalur tidak becek)',
    '["toilet","warung","area_parkir_motor"]'::jsonb,
    'Sebagian jalan setapak menyusuri tebing sungai, ada beberapa titik licin saat basah. Disarankan pakai sandal gunung/sepatu trekking.',
    '["adventure","hobi_foto","air_terjun_tersembunyi","cocok_camping_singkat"]'::jsonb,
    'https://images.example.com/curug-gomblang/cover.jpg',
    '["https://images.example.com/curug-gomblang/1.jpg","https://images.example.com/curug-gomblang/2.jpg"]'::jsonb,
    true
  ),
  (
    'Curug Bayan', null, 'curug-bayan',
    'Curug landai dengan area kolam dangkal, paling ramah untuk rombongan keluarga dan anak-anak.',
    'Curug Bayan dikenal sebagai destinasi ramah keluarga karena akses jalan yang relatif mudah dan area sekitar air terjun yang tidak terlalu curam. Banyak warung lokal berjejer di dekat area parkir, cocok untuk wisata singkat di akhir pekan.',
    'Kemutug Lor', 'Baturraden', -7.301900, 109.212700,
    'https://maps.google.com/?q=Curug+Bayan+Baturraden+Banyumas',
    'mudah', 10, 15.0,
    10000, 3000, 'Sepanjang tahun, paling ramai saat akhir pekan musim kemarau',
    '["toilet","warung","mushola","gazebo","tempat_parkir_luas"]'::jsonb,
    'Akses jalan sudah dicor/paving, jarak dari parkir ke lokasi curug sangat dekat dan landai.',
    '["pemula","keluarga","dekat_kota","budget_ramah"]'::jsonb,
    'https://images.example.com/curug-bayan/cover.jpg',
    '["https://images.example.com/curug-bayan/1.jpg","https://images.example.com/curug-bayan/2.jpg","https://images.example.com/curug-bayan/3.jpg"]'::jsonb,
    true
  ),
  (
    'Curug Jenggala', null, 'curug-jenggala',
    'Curug bertingkat dengan pemandangan lembah hijau, trek agak jauh tapi worth it untuk pecinta alam.',
    'Curug Jenggala punya beberapa tingkatan air terjun yang bisa dijelajahi berurutan. Karena posisinya cukup jauh dari jalan utama, suasananya masih sangat alami dan jarang ramai, cocok untuk rombongan kecil yang mencari ketenangan.',
    'Kracak', 'Ajibarang', -7.354600, 109.055800,
    'https://maps.google.com/?q=Curug+Jenggala+Ajibarang+Banyumas',
    'sulit', 60, 32.0,
    10000, 5000, 'Juni - Agustus (musim kemarau panjang, jalur tanah tidak licin)',
    '["warung_musiman","area_parkir_motor"]'::jsonb,
    'Trek didominasi jalan tanah dan menyeberang sungai kecil 2-3 kali, tidak disarankan setelah hujan deras. Wajib pemandu lokal untuk rombongan baru.',
    '["adventure","pecinta_alam","trek_panjang","jarang_ramai"]'::jsonb,
    'https://images.example.com/curug-jenggala/cover.jpg',
    '["https://images.example.com/curug-jenggala/1.jpg","https://images.example.com/curug-jenggala/2.jpg"]'::jsonb,
    true
  ),
  (
    'Curug Ceheng', null, 'curug-ceheng',
    'Curug kecil dengan aliran bertingkat mirip tangga alami, spot foto instagramable yang lagi naik daun.',
    'Curug Ceheng belum terlalu dikenal luas sehingga suasananya masih asri dan tidak terlalu ramai pengunjung. Formasi bebatuannya yang berundak menciptakan aliran air bertingkat yang unik untuk difoto.',
    'Sokawera', 'Cilongok', -7.265400, 109.148900,
    'https://maps.google.com/?q=Curug+Ceheng+Cilongok+Banyumas',
    'menengah', 25, 27.0,
    8000, 3000, 'April - Oktober',
    '["toilet","warung_musiman"]'::jsonb,
    'Jalur berupa jalan setapak dengan beberapa anak tangga tanah, cukup menantang untuk pemula tapi tetap aman dengan sepatu yang sesuai.',
    '["hobi_foto","adventure","hidden_gem","instagramable"]'::jsonb,
    'https://images.example.com/curug-ceheng/cover.jpg',
    '["https://images.example.com/curug-ceheng/1.jpg","https://images.example.com/curug-ceheng/2.jpg","https://images.example.com/curug-ceheng/3.jpg"]'::jsonb,
    true
  ),
  (
    'Curug Pengantin', null, 'curug-pengantin',
    'Dua aliran air terjun berdampingan yang menyerupai sepasang pengantin, ikon foto khas Banyumas.',
    'Nama Curug Pengantin berasal dari dua aliran air yang jatuh berdampingan dari tebing yang sama, seolah sepasang pengantin. Lokasinya cukup dekat dari pusat kota sehingga ramai dikunjungi terutama saat musim liburan.',
    'Kalisalak', 'Kedungbanteng', -7.310200, 109.198400,
    'https://maps.google.com/?q=Curug+Pengantin+Kedungbanteng+Banyumas',
    'mudah', 15, 12.0,
    10000, 5000, 'Sepanjang tahun, terbaik saat musim hujan karena debit air lebih deras',
    '["toilet","warung","mushola","gazebo"]'::jsonb,
    'Jalan menuju lokasi sudah beraspal, hanya perlu jalan kaki singkat dari area parkir menuju spot foto utama.',
    '["pemula","keluarga","hobi_foto","dekat_kota","ikonik"]'::jsonb,
    'https://images.example.com/curug-pengantin/cover.jpg',
    '["https://images.example.com/curug-pengantin/1.jpg","https://images.example.com/curug-pengantin/2.jpg"]'::jsonb,
    true
  )
  returning id, slug
),

new_articles as (
  insert into public.articles (
    title, slug, excerpt, content_html, cover_image_url, is_published, published_at
  )
  values
  (
    '5 Curug di Banyumas yang Wajib Kamu Kunjungi Akhir Pekan Ini',
    '5-curug-banyumas-wajib-dikunjungi',
    'Dari yang ramah keluarga sampai yang menantang buat pecinta trekking, ini rekomendasi curug terbaik di Banyumas.',
    '<h2>Banyumas dan Kekayaan Air Terjunnya</h2><p>Kabupaten Banyumas yang berada di lereng Gunung Slamet menyimpan puluhan curug dengan karakter berbeda-beda. Artikel ini merangkum lima destinasi yang paling sering direkomendasikan komunitas pendaki dan traveler lokal.</p><h3>1. Curug Cipendok</h3><p>Air terjun tertinggi dan paling ikonik, cocok untuk rombongan besar karena aksesnya paling mudah.</p><h3>2. Curug Bayan</h3><p>Pilihan tepat kalau membawa anak kecil karena kolamnya dangkal dan area sekitarnya landai.</p><p>Selengkapnya bisa kamu cek di katalog curug kami untuk info tiket, fasilitas, dan tips kunjungan.</p>',
    'https://images.example.com/articles/5-curug-banyumas/cover.jpg',
    true, now() - interval '14 days'
  ),
  (
    'Panduan Lengkap Trekking Aman ke Curug: Persiapan & Perlengkapan',
    'panduan-trekking-aman-ke-curug',
    'Sebelum berangkat explore curug, pastikan kamu sudah siapkan perlengkapan dan tahu jalur yang akan dilalui.',
    '<h2>Kenapa Persiapan Itu Penting?</h2><p>Banyak jalur menuju curug di Banyumas melewati jalan setapak, tebing sungai, atau area yang licin saat musim hujan. Persiapan yang matang akan membuat perjalanan lebih aman dan nyaman.</p><h3>Perlengkapan Wajib</h3><ul><li>Sepatu atau sandal gunung dengan grip yang baik</li><li>Air minum secukupnya</li><li>Jas hujan ringan</li><li>P3K sederhana</li></ul><p>Selalu cek info cuaca dan status jalur sebelum berangkat, terutama untuk curug dengan tingkat kesulitan menengah ke atas.</p>',
    'https://images.example.com/articles/panduan-trekking/cover.jpg',
    true, now() - interval '7 days'
  ),
  (
    'Cerita di Balik Nama Curug Pengantin, Ikon Foto Khas Banyumas',
    'cerita-di-balik-nama-curug-pengantin',
    'Kenapa disebut Curug Pengantin? Ini cerita dan fakta menarik dari salah satu curug paling instagramable di Banyumas.',
    '<h2>Dua Aliran, Satu Cerita</h2><p>Curug Pengantin mendapatkan namanya dari dua aliran air yang jatuh berdampingan dari tebing yang sama, menyerupai sepasang pengantin yang berdiri berdampingan.</p><p>Lokasinya yang dekat dari pusat kota membuat curug ini jadi salah satu destinasi favorit untuk kunjungan singkat di sore hari, terutama saat musim hujan ketika debit air sedang deras-derasnya.</p>',
    'https://images.example.com/articles/curug-pengantin-story/cover.jpg',
    true, now() - interval '2 days'
  )
  returning id
),

new_trips as (
  insert into public.trips (
    title, slug, description, itinerary, trip_type,
    trip_date, meeting_point, meeting_time,
    price_per_person, max_participants, status,
    terms_and_conditions, cover_image_url
  )
  values
  (
    'Explore Combo: Curug Cipendok & Curug Gomblang',
    'explore-cipendok-gomblang-combo',
    'Trip gabungan dua curug dalam satu hari: mulai dari Cipendok yang megah, lanjut ke Gomblang untuk berenang di kolam alami.',
    E'06.00 Kumpul & briefing di meeting point\n06.30 Perjalanan menuju Curug Cipendok\n07.30 Eksplorasi & foto-foto di Cipendok\n10.00 Perjalanan menuju Curug Gomblang\n11.00 Berenang & istirahat makan siang di Gomblang\n14.00 Perjalanan pulang',
    'public', current_date + 14, 'Alun-alun Purwokerto (depan Masjid Agung)', '06:00',
    85000, 15, 'open',
    'Peserta wajib membawa pakaian ganti, sudah termasuk asuransi perjalanan sederhana. Pembatalan H-1 tidak dapat refund.',
    'https://images.example.com/trips/combo-cipendok-gomblang/cover.jpg'
  ),
  (
    'Susur Curug Bayan - Trip Keluarga',
    'susur-curug-bayan-keluarga',
    'Trip santai cocok untuk keluarga dengan anak-anak, akses mudah dan area bermain air yang aman.',
    E'07.30 Kumpul di meeting point\n08.00 Perjalanan menuju Curug Bayan\n08.45 Main air & piknik keluarga\n12.00 Perjalanan pulang',
    'public', current_date + 21, 'Terminal Bulupitu Purwokerto', '07:30',
    50000, 20, 'open',
    'Harga sudah termasuk tiket masuk, belum termasuk konsumsi. Anak di bawah 5 tahun wajib didampingi orang tua.',
    'https://images.example.com/trips/susur-bayan-keluarga/cover.jpg'
  ),
  (
    'Private Trip Komunitas: Explore Curug Jenggala',
    'private-trip-komunitas-jenggala',
    'Trip privat khusus untuk komunitas yang sudah mendaftar via link, trekking menengah-sulit menuju Curug Jenggala.',
    E'05.30 Kumpul & pengecekan perlengkapan\n06.00 Berangkat menuju basecamp\n07.00 Mulai trekking\n09.00 Tiba di Curug Jenggala, eksplorasi\n12.00 Turun & perjalanan pulang',
    'private', current_date + 10, 'Basecamp Kracak, Ajibarang', '05:30',
    120000, 12, 'open',
    'Wajib fisik prima, disarankan sudah pernah trekking sebelumnya. Link trip ini bersifat privat, mohon tidak disebarluaskan.',
    'https://images.example.com/trips/private-jenggala/cover.jpg'
  ),
  (
    'Adventure Curug Ceheng - Slot Terbatas',
    'adventure-curug-ceheng-full',
    'Trip eksplorasi hidden gem Curug Ceheng dengan kuota sangat terbatas, sudah penuh untuk jadwal ini.',
    E'06.30 Kumpul di meeting point\n07.00 Perjalanan menuju Curug Ceheng\n08.00 Trekking & sesi foto\n11.00 Perjalanan pulang',
    'public', current_date + 7, 'Pasar Cilongok', '06:30',
    75000, 8, 'full',
    'Kuota sangat terbatas karena akses jalur sempit. Pendaftar setelah kuota penuh otomatis masuk waiting list.',
    'https://images.example.com/trips/adventure-ceheng/cover.jpg'
  )
  returning id, slug
),

trip_curug_combo as (
  insert into public.trip_curugs (trip_id, curug_id)
  select t.id, c.id
  from new_trips t
  join new_curugs c on c.slug in ('curug-cipendok', 'curug-gomblang')
  where t.slug = 'explore-cipendok-gomblang-combo'
  returning trip_id, curug_id
),

trip_curug_bayan as (
  insert into public.trip_curugs (trip_id, curug_id)
  select t.id, c.id
  from new_trips t
  join new_curugs c on c.slug = 'curug-bayan'
  where t.slug = 'susur-curug-bayan-keluarga'
  returning trip_id, curug_id
),

trip_curug_jenggala as (
  insert into public.trip_curugs (trip_id, curug_id)
  select t.id, c.id
  from new_trips t
  join new_curugs c on c.slug = 'curug-jenggala'
  where t.slug = 'private-trip-komunitas-jenggala'
  returning trip_id, curug_id
),

trip_curug_ceheng as (
  insert into public.trip_curugs (trip_id, curug_id)
  select t.id, c.id
  from new_trips t
  join new_curugs c on c.slug = 'curug-ceheng'
  where t.slug = 'adventure-curug-ceheng-full'
  returning trip_id, curug_id
),

new_participants as (
  insert into public.participants (
    trip_id, user_id, contact_name, contact_phone, contact_email,
    total_people, member_names, is_guest, status,
    private_trip_access_confirmed, notes
  )
  select t.id, p.user_id, p.contact_name, p.contact_phone, p.contact_email,
         p.total_people, p.member_names, p.is_guest, p.status,
         p.private_trip_access_confirmed, p.notes
  from (
    values
    -- 1. Trip combo (open) - guest, sudah di-approve admin
    (
      'explore-cipendok-gomblang-combo', null::uuid,
      'Dewi Anggraini', '081234567801', 'dewi.anggraini@example.com',
      2, '["Dewi Anggraini", "Rian Hidayat"]'::jsonb, true, 'approved', false,
      'Request ikut mobil paling depan karena mabuk perjalanan.'
    ),
    -- 2. Trip combo (open) - "member" (is_guest = false), masih pending
    (
      'explore-cipendok-gomblang-combo', null::uuid,
      'Bagus Setiawan', '081234567802', 'bagus.setiawan@example.com',
      1, '["Bagus Setiawan"]'::jsonb, false, 'pending', false,
      null
    ),
    -- 3. Trip keluarga Curug Bayan (open) - guest, pending, rombongan keluarga
    (
      'susur-curug-bayan-keluarga', null::uuid,
      'Siti Nur Halimah', '081234567803', null,
      4, '["Siti Nur Halimah", "Ahmad Fauzi", "Ayu Kartika", "Bima (7 tahun)"]'::jsonb, true, 'pending', false,
      'Bawa anak umur 7 tahun, mohon info titik aman untuk anak-anak.'
    ),
    -- 4. Trip Curug Ceheng (full) - guest, masuk waiting list
    (
      'adventure-curug-ceheng-full', null::uuid,
      'Fajar Nugroho', '081234567804', 'fajar.nugroho@example.com',
      2, '["Fajar Nugroho", "Wulan Sari"]'::jsonb, true, 'waitlist', false,
      'Bersedia menunggu kalau ada yang cancel.'
    ),
    -- 5. Trip Curug Ceheng (full) - member (is_guest = false), masuk waiting list
    (
      'adventure-curug-ceheng-full', null::uuid,
      'Indra Kurniawan', '081234567805', 'indra.kurniawan@example.com',
      1, '["Indra Kurniawan"]'::jsonb, false, 'waitlist', false,
      null
    )
  ) as p (
    trip_slug, user_id, contact_name, contact_phone, contact_email,
    total_people, member_names, is_guest, status,
    private_trip_access_confirmed, notes
  )
  join new_trips t on t.slug = p.trip_slug
  returning id
)

select
  (select count(*) from new_curugs)      as curugs_inserted,
  (select count(*) from new_articles)    as articles_inserted,
  (select count(*) from new_trips)       as trips_inserted,
  (
    (select count(*) from trip_curug_combo) +
    (select count(*) from trip_curug_bayan) +
    (select count(*) from trip_curug_jenggala) +
    (select count(*) from trip_curug_ceheng)
  ) as trip_curugs_inserted,
  (select count(*) from new_participants) as participants_inserted;