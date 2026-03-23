package de.ecodigit.yusuf.application.application.dtos;

public record EcoInsightsDto(
    String month,
    Long measurements,
    Double totalGlobalWarmingPotential,
    Double totalWasteElectricalAndElectronicEquipment,
    Double totalCumulativeEnergyDemand,
    Double totalWaterConsumption,
    Double totalAbioticDepletionPotential,
    Double totalEcotoxicity) {}
