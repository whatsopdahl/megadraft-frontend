import React from "react";
import { Fab, Tooltip } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface BackBtnProps {
    disabled?: boolean
}

const BackBtn: React.FC<BackBtnProps> = ({ disabled }: BackBtnProps) => {
    const navigate = useNavigate()
    return (
        <Tooltip title="Back">
            <Fab size="small" disabled={disabled} sx={{ position: 'absolute', top: 0, left: 0, m: 2 }} onClick={() => navigate(-1)}>
                <ArrowBack />
            </Fab>
        </Tooltip>
    )
}

export default BackBtn;