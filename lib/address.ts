import { psgc } from 'ph-locations';

export type AddressValue = {
  province: string;
  city: string;
  cityCode: string;
  barangay: string;
  street: string;
};

export const EMPTY_ADDRESS: AddressValue = {
  province: '',
  city: '',
  cityCode: '',
  barangay: '',
  street: '',
};

type PSGCProvince = { code: string; name: string };
type PSGCCity = {
  code: string;
  name: string;
  fullName: string;
  province: string;
  classification: string;
};

export function getProvinceOptions() {
  return (psgc.provinces as PSGCProvince[])
    .map((p) => ({ label: p.name, value: p.name, meta: p.code }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getCityOptions(provinceName: string) {
  const provinceCode = (psgc.provinces as PSGCProvince[]).find(
    (p) => p.name === provinceName,
  )?.code;
  if (!provinceCode) return [];
  return (psgc.citiesMunicipalities as PSGCCity[])
    .filter((c) => c.province === provinceCode)
    .map((c) => ({ label: c.fullName, value: c.fullName, meta: c.code }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function fetchBarangayOptions(cityCode: string) {
  const apiCode = cityCode.slice(0, 2) + '0' + cityCode.slice(2);
  const res = await fetch(
    `https://psgc.cloud/api/v2/cities-municipalities/${apiCode}/barangays`,
  );
  if (!res.ok) return [];
  const json: { data: { name: string; code: string }[] } = await res.json();
  const data = json.data ?? [];
  return data
    .map((b) => ({ label: b.name, value: b.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
