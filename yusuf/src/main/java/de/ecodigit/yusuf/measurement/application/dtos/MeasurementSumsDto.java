package de.ecodigit.yusuf.measurement.application.dtos;

public record MeasurementSumsDto(
    double totalGlobalWarmingPotential,
    double totalWasteElectricalAndElectronicEquipment,
    double totalCumulativeEnergyDemand,
    double totalWaterConsumption,
    double totalAbioticDepletionPotential,
    double totalEcoToxity) {}
