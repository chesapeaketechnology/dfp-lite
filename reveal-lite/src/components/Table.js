import React from "react";
import { Container } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function Table({data}) {

    const flattenData = (data) => {
        if (!data) return [];
        return data.map(datum => {
            return {
                _id: datum._id,
                messageType: datum.payload.messageType,
                ...datum.payload.data
            } 
        })
    }

    data = flattenData(data);

    const getRowId = (row) => {
        return row._id;
    }

    const getDeviceTime = (params) => {
        const date = new Date(params.row.deviceTime);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    }

    const columns = [
        { field: 'deviceTime', valueGetter: getDeviceTime, headerName: 'Device Time', flex: 1 },
        { field: 'deviceName', headerName: 'Device Name', flex: 1 },
        { field: 'latitude', headerName: 'Latitude', flex: 1 },
        { field: 'longitude', headerName: 'Longitude', flex: 1 },
        { field: 'messageType', headerName: 'Message Type', flex: 1 },
    ];

    return (
        <Container>
            <DataGrid 
                hideFooter
                autoHeight
                getRowId={getRowId}
                rows={data} 
                columns={columns} 
            />
        </Container>
    );
};