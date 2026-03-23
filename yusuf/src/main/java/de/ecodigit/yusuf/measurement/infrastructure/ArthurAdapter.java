package de.ecodigit.yusuf.measurement.infrastructure;

import de.ecodigit.yusuf.gitrepomanagement.application.dtos.GitDto;
import de.ecodigit.yusuf.measurement.application.dtos.allavailablemeasurementresults.AllAvailableMeasurementResultsDto;
import de.ecodigit.yusuf.measurement.application.dtos.measurementresults.MeasurementResultDto;
import de.ecodigit.yusuf.measurement.application.exceptions.ArthurAdapterException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArthurAdapter {

  private final ArthurRestClient arthurRestClient;
  private static final String MEASUREMENT_URI = "/measurement/";

  public void startMeasurement(UUID measurementId, UUID applicationVariantId) {
    arthurRestClient
        .getClient()
        .post()
        .uri(MEASUREMENT_URI + measurementId + "/start/" + applicationVariantId)
        .retrieve()
        .onStatus(
            HttpStatusCode::isError,
            ((request, response) -> {
              throw new ArthurAdapterException(
                  "Request to arthur service for starting a measurement not successfully processed:"
                      + " "
                      + response.getBody());
            }));
  }

  public void startMeasurementWithGit(
      UUID measurementId, UUID applicationVariantId, GitDto gitDto) {
    arthurRestClient
        .getClient()
        .post()
        .uri(MEASUREMENT_URI + measurementId + "/start/" + applicationVariantId + "/git")
        .body(gitDto)
        .retrieve()
        .onStatus(
            HttpStatusCode::isError,
            ((request, response) -> {
              throw new ArthurAdapterException(
                  "Request to arthur service not successfully processed: " + response.getBody());
            }));
  }

  public MeasurementResultDto getMeasurementResult(UUID measurementId) {
    return arthurRestClient
        .getClient()
        .get()
        .uri(MEASUREMENT_URI + measurementId + "/result")
        .retrieve()
        .onStatus(
            HttpStatusCode::isError,
            ((request, response) -> {
              throw new ArthurAdapterException(
                  "Request to arthur service for results not successfully processed: "
                      + response.getBody());
            }))
        .body(MeasurementResultDto.class);
  }

  public AllAvailableMeasurementResultsDto getAllAvailableMeasurementResultsFromArthur(
      UUID measurementId) {
    return arthurRestClient
        .getClient()
        .get()
        .uri(MEASUREMENT_URI + measurementId + "/getallresults")
        .retrieve()
        .onStatus(
            HttpStatusCode::isError,
            ((request, response) -> {
              throw new ArthurAdapterException(
                  "Request to arthur service for getting all results not successfully processed: "
                      + response.getBody());
            }))
        .body(AllAvailableMeasurementResultsDto.class);
  }

  public void stopMeasurement(UUID measurementId) {
    arthurRestClient
        .getClient()
        .post()
        .uri(MEASUREMENT_URI + measurementId + "/stop")
        .retrieve()
        .onStatus(
            HttpStatusCode::isError,
            ((request, response) -> {
              throw new ArthurAdapterException(
                  "Request to arthur service for stopping a Measurement not successfully processed:"
                      + " "
                      + response.getBody());
            }));
  }
}
