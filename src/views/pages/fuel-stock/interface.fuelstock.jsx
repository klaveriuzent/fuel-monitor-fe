/* eslint-disable prettier/prettier */
export const mapFuelStockData = (apiData) => {
    const list = Array.isArray(apiData?.data) ? apiData.data : Array.isArray(apiData) ? apiData : []

    return list.flatMap((item) => {
        const tanks = Array.isArray(item?.last_tank_data) ? item.last_tank_data : []

        if (!tanks.length) {
            return [{
                id_tank: '',
                id_site: String(item?.id_site ?? ''),
                aktif_flag: '',
                volume_oil: '',
                volume_air: '',
                max_capacity: '',
                ruang_kosong: '',
                temperature: '',
                update_date: '',
            }]
        }

        return tanks.map((tankData) => ({
            id_tank: String(tankData?.id_tank ?? ''),
            id_site: String(tankData?.id_site ?? item?.id_site ?? ''),
            aktif_flag: String(tankData?.aktif_flag ?? ''),
            volume_oil: tankData?.volume_oil ?? '',
            volume_air: tankData?.volume_air ?? '',
            max_capacity: tankData?.max_capacity ?? '',
            ruang_kosong: tankData?.ruang_kosong ?? '',
            temperature: tankData?.temperature ?? '',
            update_date: tankData?.update_date ?? '',
        }))
    })
}
