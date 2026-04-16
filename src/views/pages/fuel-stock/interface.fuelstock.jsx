/* eslint-disable prettier/prettier */
export const mapFuelStockData = (apiData) => {
    const list = Array.isArray(apiData?.data) ? apiData.data : Array.isArray(apiData) ? apiData : []

    return list.flatMap((item, siteIndex) => {
        const tanks = Array.isArray(item?.last_tank_data) && item.last_tank_data.length
            ? item.last_tank_data
            : [item]

        return tanks.map((tankData, tankIndex) => {
            const idTank = String(tankData?.id_tank ?? item?.id_tank ?? '')
            const idSite = String(tankData?.id_site ?? item?.id_site ?? '')
            const updateDate = String(tankData?.update_date ?? '')
            const rowId = `${idSite}-${idTank}-${updateDate}-${siteIndex}-${tankIndex}`

            return {
                row_id: rowId,
                id_tank: idTank,
                id_site: idSite,
                aktif_flag: String(tankData?.aktif_flag ?? item?.is_active ?? ''),
                volume_oil: tankData?.volume_oil ?? '0',
                volume_air: tankData?.volume_air ?? '0',
                max_capacity: tankData?.max_capacity ?? item?.total_liter ?? item?.max_capacity ?? '0',
                ruang_kosong: tankData?.ruang_kosong ?? '0',
                temperature: tankData?.temperature ?? '0',
                update_date: tankData?.update_date ?? '',
            }
        })
    })
}
