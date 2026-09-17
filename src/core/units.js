/** Unit conversions used by the shared physics core. */
export const SPEED_OF_LIGHT_MPS = 299_792_458;
export const ELEMENTARY_CHARGE_C = 1.602_176_634e-19;
export const VACUUM_PERMITTIVITY = 8.854_187_812_8e-12;
export const PROTON_REST_ENERGY_GEV = 0.938_272_081_3;
export const JOULES_PER_GEV = 1.602_176_634e-10;
export const METERS_PER_MILE = 1609.344;
export const joulesToGeV = joules => joules / JOULES_PER_GEV;
export const gevToJoules = gev => gev * JOULES_PER_GEV;
export const milesToMeters = miles => miles * METERS_PER_MILE;
export const mvPerMeterToVPerMeter = mv => mv * 1e6;
