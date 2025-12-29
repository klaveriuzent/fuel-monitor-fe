/* eslint-disable prettier/prettier */
export const mapFuelStockData = (apiData) => {
    const list = Array.isArray(apiData.data) ? apiData.data : apiData

    return list.map((item) => {
        const tankData =
            Array.isArray(item.last_tank_data) && item.last_tank_data.length > 0
                ? item.last_tank_data[0]
                : {}

        return {
            id_tank: tankData.id_tank ?? '',
            id_site: tankData.id_site ?? item.id_site ?? '',
            aktif_flag: tankData.aktif_flag ?? '',
            volume_oil: tankData.volume_oil ?? '',
            volume_air: tankData.volume_air ?? '',
            max_capacity: tankData.max_capacity ?? '',
            ruang_kosong: tankData.ruang_kosong ?? '',
            temperature: tankData.temperature ?? '',
            update_date: tankData.update_date ?? '',
        }
    })
}
