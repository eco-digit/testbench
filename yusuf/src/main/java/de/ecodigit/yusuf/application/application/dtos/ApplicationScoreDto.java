package de.ecodigit.yusuf.application.application.dtos;

import java.util.List;

public record ApplicationScoreDto(String applicationName, List<MonthlyScoreDto> monthlyScores) {}
