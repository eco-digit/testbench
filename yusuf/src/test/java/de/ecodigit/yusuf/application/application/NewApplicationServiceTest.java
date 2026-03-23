package de.ecodigit.yusuf.application.application;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.mockito.Mockito.when;

import de.ecodigit.yusuf.application.application.exceptions.ApplicationNotFoundException;
import de.ecodigit.yusuf.application.infrastructure.ApplicationEntity;
import de.ecodigit.yusuf.application.infrastructure.ApplicationEntityMapper;
import de.ecodigit.yusuf.application.infrastructure.ApplicationRepository;
import de.ecodigit.yusuf.artefact.infrastructure.ArtefactRepository;
import de.ecodigit.yusuf.context.infrastructure.ContextRepository;
import de.ecodigit.yusuf.gitrepomanagement.infrastructure.GitRepository;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementEntityMapper;
import de.ecodigit.yusuf.measurement.infrastructure.MeasurementRepository;
import de.ecodigit.yusuf.organization.infrastructure.OrganizationRepository;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class NewApplicationServiceTest {
  public static final UUID APPLICATION_ID = UUID.randomUUID();

  private ApplicationService applicationService;

  private AutoCloseable closeable;

  @Mock private ApplicationRepository applicationRepository;

  @Mock private OrganizationRepository organizationRepository;

  @Mock private MeasurementRepository measurementRepository;

  @Mock private ArtefactRepository artefactRepository;

  @Mock private GitRepository gitRepository;

  @Mock private ContextRepository contextRepository;

  private final MeasurementEntityMapper measurementEntityMapper = MeasurementEntityMapper.INSTANCE;

  private final ApplicationEntityMapper applicationEntityMapper = ApplicationEntityMapper.INSTANCE;

  @AfterEach
  void cleanUp() throws Exception {
    closeable.close();
  }

  @BeforeEach
  void setUp() {
    closeable = MockitoAnnotations.openMocks(this);

    applicationService =
        new ApplicationService(
            applicationRepository,
            organizationRepository,
            measurementRepository,
            artefactRepository,
            gitRepository,
            contextRepository,
            measurementEntityMapper,
            applicationEntityMapper);
  }

  @Test
  void getApplicationInfo_ApplicationWithoutRepository_ShouldReturnApplication() {
    // GIVEN
    var applicationEntity = getDummyApplicationEntity().build();
    when(applicationRepository.findById(applicationEntity.getId()))
        .thenReturn(Optional.of(applicationEntity));

    // WHEN
    var result = applicationService.getApplication(applicationEntity.getId());

    // THEN
    assertThat(result).isNotNull();
    assertThat(result.id()).isEqualTo(applicationEntity.getId());
  }

  @Test
  void getApplicationInfo_NoApplication_ShouldThrowException() {
    // GIVEN
    when(applicationRepository.findById(APPLICATION_ID)).thenReturn(Optional.empty());

    // THEN
    assertThatThrownBy(() -> applicationService.getApplication(APPLICATION_ID))
        .isInstanceOf(ApplicationNotFoundException.class);
  }

  private static ApplicationEntity.ApplicationEntityBuilder getDummyApplicationEntity() {
    return ApplicationEntity.builder()
        .id(APPLICATION_ID)
        .name("Application_1")
        .description("Description");
  }
}
