export interface File_creator {
  software_version: number;
}

export interface Device_setting {
  utc_offset: number;
  time_offset: number;
  active_time_zone: number;
  time_zone_offset: number;
  mounting_side: string;
}

export interface User_profile {
  weight: number;
  gender: string;
  height: number;
  language: string;
  elev_setting: string;
  weight_setting: string;
  resting_heart_rate: number;
  hr_setting: string;
  speed_setting: string;
  dist_setting: string;
  position_setting: string;
  temperature_setting: string;
  height_setting: string;
}

export interface Zones_target {
  functional_threshold_power: number;
  max_heart_rate: number;
  threshold_heart_rate: number;
  hr_calc_type: string;
  pwr_calc_type: string;
}

export interface Activity {
  timestamp: string;
  total_timer_time: number;
  local_timestamp: string;
  num_sessions: number;
  type: string;
  event: string;
  event_type: string;
}

export interface Message_index {
  0: boolean;
  value: number;
  reserved: boolean;
  selected: boolean;
}

export interface Left_right_balance {
  0: boolean;
  value: number;
  right: boolean;
}

export interface Session {
  timestamp: string;
  start_time: string;
  total_elapsed_time: number;
  total_timer_time: number;
  total_distance: number;
  total_cycles: number;
  enhanced_avg_speed: number;
  message_index: Message_index;
  total_calories: number;
  first_lap_index: number;
  num_laps: number;
  left_right_balance: Left_right_balance;
  event: string;
  event_type: string;
  sport: string;
  sub_sport: string;
  avg_heart_rate: number;
  max_heart_rate: number;
  avg_cadence: number;
  max_cadence: number;
  total_training_effect: number;
  trigger: string;
  avg_fractional_cadence: number;
  max_fractional_cadence: number;
  total_anaerobic_effect: number;
}

export interface Message_index {
  0: boolean;
  value: number;
  reserved: boolean;
  selected: boolean;
}

export interface Left_right_balance {
  0: boolean;
  value: number;
  right: boolean;
}

export interface Wkt_step_index {
  0: boolean;
  value: number;
  reserved: boolean;
  selected: boolean;
}

export interface Lap {
  timestamp: string;
  start_time: string;
  total_elapsed_time: number;
  total_timer_time: number;
  total_distance: number;
  total_cycles: number;
  enhanced_avg_speed: number;
  message_index: Message_index;
  total_calories: number;
  left_right_balance: Left_right_balance;
  wkt_step_index: Wkt_step_index;
  event: string;
  event_type: string;
  avg_heart_rate: number;
  max_heart_rate: number;
  avg_cadence: number;
  max_cadence: number;
  lap_trigger: string;
  sport: string;
  sub_sport: string;
  avg_fractional_cadence: number;
  max_fractional_cadence: number;
}

export interface Record {
  timestamp: Date;
  elapsed_time: number;
  timer_time: number;
  distance: number;
  heart_rate: number;
  enhanced_altitude: number;
  cadence: number;
  fractional_cadence: number;
}

export interface Event {
  timestamp: string;
  data: number;
  event: string;
  event_type: string;
  event_group: number;
}

export interface Device_info {
  timestamp: string;
  serial_number: number;
  manufacturer: string;
  product: number;
  software_version: number;
  device_index: number;
  source_type: string;
}

export interface Sport {
  name: string;
  sport: string;
  sub_sport: string;
}

export interface Device {
  timestamp: string;
  serial_number: number;
  manufacturer: string;
  product: number;
  software_version: number;
  device_index: number;
  source_type: string;
}

export interface File_id {
  serial_number: number;
  time_created: string;
  manufacturer: string;
  product: number;
  type: string;
}

export interface GarminFit {
  protocolVersion: number;
  profileVersion: number;
  file_creator: File_creator;
  device_settings: Device_setting;
  user_profile: User_profile;
  zones_target: Zones_target;
  activity: Activity;
  sessions: Session[];
  laps: Lap[];
  lengths: any[];
  records: Record[];
  events: Event[];
  device_infos: Device_info[];
  developer_data_ids: any[];
  field_descriptions: any[];
  hrv: any[];
  dive_gases: any[];
  course_points: any[];
  sports: Sport[];
  devices: Device[];
  monitors: any[];
  stress: any[];
  file_ids: File_id[];
  monitor_info: any[];
  definitions: any[];
}
