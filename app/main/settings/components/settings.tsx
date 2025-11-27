"use client";

import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { z } from "zod";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/* ========= Types ========= */

type Farmer = {
  user_id: string;
  phone: string | null;
  birth_date: string | null;
  gender: "Male" | "Female" | null;
  province: string | null;
  regency: string | null;
  district: string | null;
  village: string | null;
  street: string | null;
  postcode: string | null;
  address: string | null;
  created_at: string | null;
};

type AuthMeta = {
  full_name?: string;
  name?: string;
  email?: string;
  picture?: string;
  avatar_url?: string;
};

type Wilayah = { id: string; name: string };

const WILAYAH_BASE = "https://www.emsifa.com/api-wilayah-indonesia/api";
const provinsiURL = () => `${WILAYAH_BASE}/provinces.json`;
const regencyURL = (provId: string) => `${WILAYAH_BASE}/regencies/${provId}.json`;
const districtURL = (regId: string) => `${WILAYAH_BASE}/districts/${regId}.json`;
const villageURL = (distId: string) => `${WILAYAH_BASE}/villages/${distId}.json`;

/* ========= Helpers ========= */

const normalize = (s?: string | null) => (s ?? "").trim().toLowerCase();

function getAuthEmail(u: User | null): string | null {
  if (u?.email) return u.email;
  const meta = (u?.user_metadata ?? {}) as AuthMeta;
  if (meta.email) return meta.email;
  const identities = u?.identities ?? [];
  for (const id of identities) {
    const raw = (id as { identity_data?: unknown })?.identity_data;
    const data =
      typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : undefined;
    const mail = typeof data?.email === "string" ? data.email : undefined;
    if (mail) return mail;
  }
  return null;
}

function getAuthFullName(u: User | null, email: string | null): string {
  const meta = (u?.user_metadata ?? {}) as AuthMeta;
  return meta.full_name ?? meta.name ?? (email ? email.split("@")[0] : "");
}

function getAuthAvatarUrl(u: User | null): string | undefined {
  const meta = (u?.user_metadata ?? {}) as AuthMeta;
  return meta.avatar_url ?? meta.picture;
}

function formatJoined(createdAt?: string) {
  if (!createdAt) return "-";
  const d = new Date(createdAt);
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function unmaskPhone(v: string) {
  return v.replace(/[^\d+]/g, "");
}

/* ====== Zod Schemas ====== */

const personalSchema = z.object({
  phone: z
    .string()
    .refine(
      (val) =>
        val === "" ||
        /^(?:\+62|0)8[1-9][0-9]{6,11}$/.test(val.replace(/\s/g, "")),
      "Phone must follow Indonesian format (+62 or 0)"
    ),
  birth_date: z
    .string()
    .refine((v) => v === "" || !Number.isNaN(new Date(v).getTime()), "Invalid date")
    .refine((v) => v === "" || new Date(v) <= new Date(), "Birth date cannot be in the future"),
  gender: z.enum(["Male", "Female"]).nullable(),
});

const addressSchema = z.object({
  province: z.string(),
  regency: z.string(),
  district: z.string(),
  village: z.string(),
  street: z.string(),
  postcode: z.string(),
  address: z.string(),
});

type PersonalForm = z.infer<typeof personalSchema>;
type AddressForm = z.infer<typeof addressSchema>;

/* ========= Component ========= */

export default function ProfileContent() {
  const supabase = getSupabaseBrowser();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [farmer, setFarmer] = useState<Farmer | null>(null);

  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const {
    register: personalRegister,
    handleSubmit: handlePersonalSubmit,
    reset: resetPersonal,
    control: personalControl,
    formState: {
      isDirty: personalDirty,
      isSubmitting: personalSubmitting,
      errors: personalErrors,
    },
  } = useForm<PersonalForm>({
    resolver: zodResolver(personalSchema),
    defaultValues: { phone: "", birth_date: "", gender: null },
    mode: "onChange",
  });

  const {
    register: addressRegister,
    handleSubmit: handleAddressSubmit,
    reset: resetAddress,
    control: addressControl,
    setValue: setAddressValue,
    formState: {
      isDirty: addressDirty,
      isSubmitting: addressSubmitting,
    },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      province: "",
      regency: "",
      district: "",
      village: "",
      street: "",
      postcode: "",
      address: "",
    },
    mode: "onChange",
  });

  const [provOptions, setProvOptions] = useState<Wilayah[]>([]);
  const [regOptions, setRegOptions] = useState<Wilayah[]>([]);
  const [distOptions, setDistOptions] = useState<Wilayah[]>([]);
  const [villOptions, setVillOptions] = useState<Wilayah[]>([]);

  const [selectedProvId, setSelectedProvId] = useState<string>("");
  const [selectedRegId, setSelectedRegId] = useState<string>("");
  const [selectedDistId, setSelectedDistId] = useState<string>("");

  /* ========= Fetch wilayah options ========= */

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(provinsiURL());
        const data: Wilayah[] = await res.json();
        setProvOptions(data);
      } catch (e) {
        console.error("fetch provinces error:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProvId) {
      setRegOptions([]);
      setSelectedRegId("");
      setDistOptions([]);
      setSelectedDistId("");
      setVillOptions([]);
      setAddressValue("regency", "");
      setAddressValue("district", "");
      setAddressValue("village", "");
      return;
    }
    (async () => {
      try {
        const res = await fetch(regencyURL(selectedProvId));
        const data: Wilayah[] = await res.json();
        setRegOptions(data);

        setDistOptions([]);
        setVillOptions([]);
        setSelectedRegId("");
        setSelectedDistId("");
        setAddressValue("district", "");
        setAddressValue("village", "");
      } catch (e) {
        console.error("fetch regencies error:", e);
      }
    })();
  }, [selectedProvId, setAddressValue]);

  useEffect(() => {
    if (!selectedRegId) {
      setDistOptions([]);
      setSelectedDistId("");
      setVillOptions([]);
      return;
    }
    (async () => {
      const res = await fetch(districtURL(selectedRegId));
      const data: Wilayah[] = await res.json();
      setDistOptions(data);

      setVillOptions([]);
      setSelectedDistId("");
      setAddressValue("district", "");
      setAddressValue("village", "");
    })();
  }, [selectedRegId, setAddressValue]);

  useEffect(() => {
    if (!selectedDistId) {
      setVillOptions([]);
      return;
    }
    (async () => {
      const res = await fetch(villageURL(selectedDistId));
      const data: Wilayah[] = await res.json();
      setVillOptions(data);
      // village akan di-set lagi oleh prefill kalau ada data farmer
      setAddressValue("village", "");
    })();
  }, [selectedDistId, setAddressValue]);

  /* ========= Fetch user & farmer ========= */

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user: u },
        error,
      } = await supabase.auth.getUser();
      if (error) console.error("getUser error:", error);
      setUser(u ?? null);

      if (u) {
        const { data, error: fErr } = await supabase
          .from("farmers")
          .select(
            "user_id, phone, birth_date, gender, province, regency, district, village, street, postcode, address, created_at"
          )
          .eq("user_id", u.id)
          .maybeSingle();

        if (fErr) console.error("farmers select error:", fErr);
        const f = (data ?? null) as Farmer | null;
        setFarmer(f);

        resetPersonal({
          phone: f?.phone ?? "",
          birth_date: f?.birth_date ?? "",
          gender: f?.gender ?? null,
        });
        resetAddress({
          province: f?.province ?? "",
          regency: f?.regency ?? "",
          district: f?.district ?? "",
          village: f?.village ?? "",
          street: f?.street ?? "",
          postcode: f?.postcode ?? "",
          address: f?.address ?? "",
        });

        const av = getAuthAvatarUrl(u);
        if (av) setAvatarUrl(av);
      }

      setLoading(false);
    })();
  }, [supabase, resetPersonal, resetAddress]);

  /* ========= Prefill cascading IDs from farmer names ========= */

  useEffect(() => {
    if (!farmer || provOptions.length === 0) return;

    const p = provOptions.find(
      (x) => normalize(x.name) === normalize(farmer.province)
    );
    if (p) {
      setSelectedProvId(p.id);
      setAddressValue("province", p.name);
    }
  }, [farmer, provOptions, setAddressValue]);

  useEffect(() => {
    if (!farmer || regOptions.length === 0) return;

    const r = regOptions.find(
      (x) => normalize(x.name) === normalize(farmer.regency)
    );
    if (r) {
      setSelectedRegId(r.id);
      setAddressValue("regency", r.name);
    }
  }, [farmer, regOptions, setAddressValue]);

  useEffect(() => {
    if (!farmer || distOptions.length === 0) return;

    const d = distOptions.find(
      (x) => normalize(x.name) === normalize(farmer.district)
    );
    if (d) {
      setSelectedDistId(d.id);
      setAddressValue("district", d.name);
    }
  }, [farmer, distOptions, setAddressValue]);

  useEffect(() => {
    if (!farmer || villOptions.length === 0) return;

    const v = villOptions.find(
      (x) => normalize(x.name) === normalize(farmer.village)
    );
    if (v) {
      setAddressValue("village", v.name);
    }
  }, [farmer, villOptions, setAddressValue]);

  /* ========= Display info ========= */

  const display = useMemo(() => {
    const email = getAuthEmail(user) ?? "";
    const name = getAuthFullName(user, email);
    return {
      userId: user?.id ?? "",
      email,
      name,
      joined: formatJoined(user?.created_at ?? undefined),
    };
  }, [user]);

  /* ========= Avatar upload ========= */

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    try {
      setAvatarUploading(true);
      setAvatarPreview(URL.createObjectURL(file));

      const bucket = "profile-photos";
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${user.id}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || `image/${ext}`,
        });

      if (upErr) {
        console.error("[avatar upload error]", upErr);
        alert(`Avatar upload failed: ${upErr.message ?? "Unknown error"}`);
        return;
      }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      if (!pub?.publicUrl) {
        alert("Could not get avatar public URL.");
        return;
      }

      setAvatarUrl(pub.publicUrl);

      const { error: updErr } = await supabase.auth.updateUser({
        data: { avatar_url: pub.publicUrl },
      });
      if (updErr) {
        console.error("[update user avatar error]", updErr);
        alert("Avatar uploaded, but failed to update profile.");
      }

      const inputEl = document.getElementById("avatarUpload") as HTMLInputElement | null;
      if (inputEl) inputEl.value = "";
    } finally {
      setAvatarUploading(false);
    }
  };

  /* ========= Save handlers ========= */

  const onSavePersonal: SubmitHandler<PersonalForm> = async (values) => {
    if (!user) return;
    setSavingPersonal(true);
    const payload: Partial<Farmer> & { user_id: string } = {
      user_id: user.id,
      phone: values.phone ? unmaskPhone(values.phone) : null,
      birth_date: values.birth_date || null,
      gender: values.gender ?? null,
    };
    const { error } = await supabase.from("farmers").upsert(payload, { onConflict: "user_id" });
    setSavingPersonal(false);
    if (error) alert("Failed to save personal info.");
    else alert("Personal info saved!");
  };

  const onSaveAddress: SubmitHandler<AddressForm> = async (values) => {
    if (!user) return;
    setSavingAddress(true);
    const payload: Partial<Farmer> & { user_id: string } = {
      user_id: user.id,
      province: values.province || null,
      regency: values.regency || null,
      district: values.district || null,
      village: values.village || null,
      street: values.street || null,
      postcode: values.postcode || null,
      address: values.address || null,
    };
    const { error } = await supabase.from("farmers").upsert(payload, { onConflict: "user_id" });
    setSavingAddress(false);
    if (error) alert("Failed to save address.");
    else alert("Address saved!");
  };

  /* ========= Danger zone handler (stub) ========= */

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      // TODO: implement real delete logic (Edge Function / RPC)
      alert("Delete account handler called. Implement real logic here.");
    } finally {
      setDeleting(false);
    }
  };

  /* ========= Loading / no user ========= */

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-sm text-muted-foreground">
        You need to be signed in to manage your account settings.
      </div>
    );
  }

  /* ========= UI: Multi-Card Layout ========= */

  return (
    <div className="@container/card space-y-6">
      {/* ===== Card 1: Account overview (avatar + basic info) ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 @[540px]/card:flex-row @[540px]/card:items-center @[540px]/card:justify-between">
            <div>
              <CardTitle>Account overview</CardTitle>
              <CardDescription>
                Your profile identity across the dashboard.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6">
          <section className="grid gap-4 sm:grid-cols-[auto,minmax(0,1fr)] sm:items-center">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28 ring-2 ring-muted">
                <AvatarImage src={avatarPreview || avatarUrl || ""} />
                <AvatarFallback className="bg-muted text-lg font-semibold">
                  {display.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Your profile picture is shown across the dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">{display.name}</p>
                <p className="text-xs text-muted-foreground">{display.email}</p>
                <p className="text-xs text-muted-foreground">
                  Joined <span className="font-medium">{display.joined}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  id="avatarUpload"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (f) await handleAvatarUpload(f);
                  }}
                />
                <Button size="sm" asChild disabled={avatarUploading}>
                  <label
                    htmlFor="avatarUpload"
                    className="flex cursor-pointer items-center gap-2"
                  >
                    {avatarUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {avatarUploading ? "Uploading…" : "Change photo"}
                  </label>
                </Button>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>

      {/* ===== Card 2: Personal information ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                Update your basic personal details used for contact and records.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6 space-y-6">
          {/* Readonly auth info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="userid">User ID</Label>
              <Input id="userid" value={display.userId} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={display.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullname">Full name</Label>
              <Input id="fullname" value={display.name} disabled />
            </div>
          </div>

          {/* Editable personal form */}
          <form onSubmit={handlePersonalSubmit(onSavePersonal)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="e.g., +62 812 3456 7890"
                  {...personalRegister("phone")}
                  className={cn(
                    personalErrors.phone && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {personalErrors.phone && (
                  <p className="text-sm text-red-600">{personalErrors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birth_date">Date of birth</Label>
                <Input id="birth_date" type="date" {...personalRegister("birth_date")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Controller
                  name="gender"
                  control={personalControl}
                  render={({ field }) => (
                    <Select
                      onValueChange={(val) => field.onChange(val as "Male" | "Female")}
                      value={field.value ?? undefined}
                    >
                      <SelectTrigger
                        id="gender"
                        className={cn(
                          "transition-colors",
                          personalErrors.gender &&
                            "border-red-500 focus-visible:ring-red-500"
                        )}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {personalErrors.gender && (
                  <p className="text-sm text-red-600">
                    {personalErrors.gender.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingPersonal || personalSubmitting || !personalDirty}
              >
                {savingPersonal || personalSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save personal"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ===== Card 3: Address details ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Address details</CardTitle>
              <CardDescription>
                Set the main address used for livestock and activity tracking.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6 space-y-6">
          <form onSubmit={handleAddressSubmit(onSaveAddress)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {/* Province */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="province">Province</Label>
                <Controller
                  name="province"
                  control={addressControl}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const found = provOptions.find((p) => p.name === val);
                        setSelectedProvId(found?.id ?? "");
                      }}
                    >
                      <SelectTrigger id="province">
                        <SelectValue placeholder="Select province" />
                      </SelectTrigger>
                      <SelectContent>
                        {provOptions.map((p) => (
                          <SelectItem key={p.id} value={p.name}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Regency */}
              <div className="space-y-2">
                <Label htmlFor="regency">Regency</Label>
                <Controller
                  name="regency"
                  control={addressControl}
                  render={({ field }) => (
                    <Select
                      disabled={!selectedProvId}
                      value={field.value || undefined}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const found = regOptions.find((r) => r.name === val);
                        setSelectedRegId(found?.id ?? "");
                      }}
                    >
                      <SelectTrigger id="regency">
                        <SelectValue
                          placeholder={
                            !selectedProvId ? "Select province first" : "Select regency"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {regOptions.map((r) => (
                          <SelectItem key={r.id} value={r.name}>
                            {r.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* District */}
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Controller
                  name="district"
                  control={addressControl}
                  render={({ field }) => (
                    <Select
                      disabled={!selectedRegId}
                      value={field.value || undefined}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const found = distOptions.find((d) => d.name === val);
                        setSelectedDistId(found?.id ?? "");
                      }}
                    >
                      <SelectTrigger id="district">
                        <SelectValue
                          placeholder={
                            !selectedRegId ? "Select regency first" : "Select district"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {distOptions.map((d) => (
                          <SelectItem key={d.id} value={d.name}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Village */}
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="village">Village</Label>
                <Controller
                  name="village"
                  control={addressControl}
                  render={({ field }) => (
                    <Select
                      disabled={!selectedDistId}
                      value={field.value || undefined}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger id="village">
                        <SelectValue
                          placeholder={
                            !selectedDistId ? "Select district first" : "Select village"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {villOptions.map((v) => (
                          <SelectItem key={v.id} value={v.name}>
                            {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Street */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">Street</Label>
                <Input
                  id="street"
                  placeholder="Street name, RT/RW, number"
                  {...addressRegister("street")}
                />
              </div>

              {/* Postcode */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="postcode">Post code</Label>
                <Input
                  id="postcode"
                  placeholder="e.g., 40135"
                  {...addressRegister("postcode")}
                />
              </div>
            </div>

            {/* Full address */}
            <div className="space-y-2">
              <Label htmlFor="address">Full address</Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="Building, floor, landmark, delivery notes, etc."
                className="resize-y"
                {...addressRegister("address")}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={savingAddress || addressSubmitting || !addressDirty}
              >
                {savingAddress || addressSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  "Save address"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ===== Card 4: Danger zone ===== */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-destructive">Danger zone</CardTitle>
              <CardDescription>
                Delete your account and all associated data. This action cannot be undone.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 sm:pt-6">
          <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">Delete account</p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                All livestock records, weight history, and analytics linked to this account
                will be permanently removed.
              </p>
            </div>

            <Button
              variant="destructive"
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting…
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete account
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
