export class ScheduleUtils {
    public static readonly SYNC_METADATA_INTERVAL = 1;//MINUTES 
    public static readonly SCANDATA_TIME = "3 7 1 12 *";//MINUTES 
    public static readonly SWAP_METADATA_TIME = "3 8 1 12 *";//MINUTES 
    public static readonly DEFALT_TIMEZONE = {
        scheduled: true,
        timezone: "Africa/Sao_Tome"
    }
}