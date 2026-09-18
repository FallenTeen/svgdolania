"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save } from "lucide-react";
import {
  createCurug,
  updateCurug,
  uploadCurugImage,
} from "@/app/admin/curugs/actions";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { GalleryUploader } from "@/components/admin/GalleryUploader";
import { CheckboxGroup } from "@/components/admin/CheckboxGroup";
import type { Curug } from "@/lib/types";

const FACILITY_OPTIONS = [
  { value: "toilet", label: "Toilet" },
  { value: "warung", label: "Warung" },
  { value: "warung_musiman", label: "Warung musiman" },
  { value: "mushola", label: "Mushola" },
  { value: "gazebo", label: "Gazebo" },
  { value: "area_camping", label: "Area camping" },
  { value: "tempat_parkir_luas", label: "Parkir luas" },
  { value: "area_parkir_motor", label: "Parkir motor" },
];

const TAG_OPTIONS = [
  { value: "pemula", label: "Ramah pemula" },
  { value: "keluarga", label: "Cocok keluarga" },
  { value: "hobi_foto", label: "Spot foto" },
  { value: "adventure", label: "Adventure" },
  { value: "dekat_kota", label: "Dekat kota" },
  { value: "camping", label: "Camping" },
  { value: "budget_ramah", label: "Budget ramah" },
  { value: "pecinta_alam", label: "Pecinta alam" },
  { value: "trek_panjang", label: "Trek panjang" },
  { value: "jarang_ramai", label: "Jarang ramai" },
  { value: "hidden_gem", label: "Hidden gem" },
  { value: "instagramable", label: "Instagramable" },
  { value: "ikonik", label: "Ikonik" },
];

const DIFFICULTY_OPTIONS = [
  { value: "mudah", label: "Mudah" },
  { value: "menengah", label: "Menengah" },
  { value: "sulit", label: "Sulit" },
];

const curugFormSchema = z.object({
  name: z.string().min(1, "Nama curug wajib diisi"),
  alt_name: z.string().optional(),
  village: z.string().optional(),
  district: z.string().optional(),
  short_description: z.string().optional(),
  long_description: z.string().optional(),
  latitude: z.union([z.coerce.number(), z.literal("")]).optional(),
  longitude: z.union([z.coerce.number(), z.literal("")]).optional(),
  google_maps_url: z
    .union([z.string().url("URL tidak valid"), z.literal("")])
    .optional(),
  difficulty: z.enum(["mudah", "menengah", "sulit", ""]).optional(),
  trek_duration_minutes: z
    .union([z.coerce.number().int().nonnegative(), z.literal("")])
    .optional(),
  distance_from_city_km: z
    .union([z.coerce.number().nonnegative(), z.literal("")])
    .optional(),
  ticket_price: z.coerce.number().int().nonnegative("Tidak boleh negatif"),
  parking_price: z.coerce.number().int().nonnegative("Tidak boleh negatif"),
  best_time_to_visit: z.string().optional(),
  access_notes: z.string().optional(),
});

type CurugFormInput = z.input<typeof curugFormSchema>;
type CurugFormValues = z.output<typeof curugFormSchema>;

export function CurugForm({ curug }: { curug: Curug | null }) {
  const router = useRouter();
  const isNew = !curug;

  const [facilities, setFacilities] = useState<string[]>(
    curug?.facilities ?? [],
  );
  const [tags, setTags] = useState<string[]>(curug?.tags ?? []);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    curug?.cover_image_url ?? null,
  );
  const [gallery, setGallery] = useState<string[]>(curug?.gallery ?? []);
  const [isPublished, setIsPublished] = useState<boolean>(
    curug?.is_published ?? true,
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CurugFormInput, unknown, CurugFormValues>({
    resolver: zodResolver(curugFormSchema),
    defaultValues: {
      name: curug?.name ?? "",
      alt_name: curug?.alt_name ?? "",
      village: curug?.village ?? "",
      district: curug?.district ?? "",
      short_description: curug?.short_description ?? "",
      long_description: curug?.long_description ?? "",
      latitude: curug?.latitude ?? "",
      longitude: curug?.longitude ?? "",
      google_maps_url: curug?.google_maps_url ?? "",
      difficulty: (curug?.difficulty as CurugFormValues["difficulty"]) ?? "",
      trek_duration_minutes: curug?.trek_duration_minutes ?? "",
      distance_from_city_km: curug?.distance_from_city_km ?? "",
      ticket_price: curug?.ticket_price ?? 0,
      parking_price: curug?.parking_price ?? 0,
      best_time_to_visit: curug?.best_time_to_visit ?? "",
      access_notes: curug?.access_notes ?? "",
    },
  });

  function onSubmit(values: CurugFormValues) {
    setSubmitError(null);
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      formData.set(
        key,
        value === undefined || value === null ? "" : String(value),
      );
    });
    formData.set("facilities", JSON.stringify(facilities));
    formData.set("tags", JSON.stringify(tags));
    formData.set("cover_image_url", coverImageUrl ?? "");
    formData.set("gallery", JSON.stringify(gallery));
    formData.set("is_published", String(isPublished));

    startTransition(async () => {
      const result = isNew
        ? await createCurug(formData)
        : await updateCurug(curug!.id, formData);
      if (!result.success) {
        setSubmitError(result.error ?? "Gagal menyimpan curug");
        return;
      }
      router.push("/admin/curugs");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto max-w-3xl space-y-6"
      noValidate
    >
      <Section title="Informasi Dasar">
        <Field label="Nama curug" error={errors.name?.message}>
          <input
            {...register("name")}
            className={inputClass}
            placeholder="Curug Cipendok"
          />
        </Field>
        <Field label="Nama alternatif" error={errors.alt_name?.message}>
          <input
            {...register("alt_name")}
            className={inputClass}
            placeholder="Opsional"
          />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Desa" error={errors.village?.message}>
            <input {...register("village")} className={inputClass} />
          </Field>
          <Field label="Kecamatan" error={errors.district?.message}>
            <input {...register("district")} className={inputClass} />
          </Field>
        </div>
        <Field
          label="Deskripsi singkat"
          error={errors.short_description?.message}
        >
          <textarea
            {...register("short_description")}
            rows={2}
            className={inputClass}
          />
        </Field>
        <Field
          label="Deskripsi lengkap"
          error={errors.long_description?.message}
        >
          <textarea
            {...register("long_description")}
            rows={5}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Lokasi">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Latitude" error={errors.latitude?.message as string}>
            <input
              {...register("latitude")}
              className={inputClass}
              placeholder="-7.3xxx"
            />
          </Field>
          <Field label="Longitude" error={errors.longitude?.message as string}>
            <input
              {...register("longitude")}
              className={inputClass}
              placeholder="109.2xxx"
            />
          </Field>
        </div>
        <Field label="Google Maps URL" error={errors.google_maps_url?.message}>
          <input
            {...register("google_maps_url")}
            className={inputClass}
            placeholder="https://maps.google.com/..."
          />
        </Field>
      </Section>

      <Section title="Detail Trek">
        <Field label="Tingkat kesulitan" error={errors.difficulty?.message}>
          <select {...register("difficulty")} className={inputClass}>
            <option value="">Pilih tingkat kesulitan</option>
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Durasi trek (menit)"
            error={errors.trek_duration_minutes?.message as string}
          >
            <input
              {...register("trek_duration_minutes")}
              className={inputClass}
            />
          </Field>
          <Field
            label="Jarak dari kota (km)"
            error={errors.distance_from_city_km?.message as string}
          >
            <input
              {...register("distance_from_city_km")}
              className={inputClass}
            />
          </Field>
          <Field
            label="Harga tiket masuk (Rp)"
            error={errors.ticket_price?.message}
          >
            <input {...register("ticket_price")} className={inputClass} />
          </Field>
          <Field
            label="Harga parkir (Rp)"
            error={errors.parking_price?.message}
          >
            <input {...register("parking_price")} className={inputClass} />
          </Field>
        </div>
        <Field
          label="Waktu terbaik berkunjung"
          error={errors.best_time_to_visit?.message}
        >
          <input
            {...register("best_time_to_visit")}
            className={inputClass}
            placeholder="Musim kemarau, pagi hari"
          />
        </Field>
        <Field label="Catatan akses jalan" error={errors.access_notes?.message}>
          <textarea
            {...register("access_notes")}
            rows={2}
            className={inputClass}
          />
        </Field>
      </Section>

      <Section title="Fasilitas & Tag">
        <CheckboxGroup
          label="Fasilitas"
          options={FACILITY_OPTIONS}
          value={facilities}
          onChange={setFacilities}
        />
        <CheckboxGroup
          label="Tag"
          options={TAG_OPTIONS}
          value={tags}
          onChange={setTags}
        />
      </Section>

      <Section title="Foto">
        <ImageUploader
          label="Cover Image"
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          uploadAction={uploadCurugImage}
        />
        <GalleryUploader
          value={gallery}
          onChange={setGallery}
          uploadAction={uploadCurugImage}
        />
      </Section>

      <Section title="Publikasi">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 accent-emerald-600"
          />
          Publikasikan curug ini (tampil di halaman publik)
        </label>
      </Section>

      {submitError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {submitError}
        </p>
      )}

      <div className="flex justify-end border-t border-gray-100 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {isNew ? "Simpan Curug" : "Simpan Perubahan"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
