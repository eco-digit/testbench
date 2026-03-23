package de.ecodigit.yusuf.gitrepomanagement.infrastructure;

import de.ecodigit.yusuf.gitrepomanagement.application.dtos.GitDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface GitEntityMapper {

  @Mapping(source = "context.id", target = "contextId")
  GitDto toGitDto(GitEntity gitEntity);

  @Mapping(source = "contextId", target = "context.id")
  GitEntity toGitEntity(GitDto gitDto);
}
