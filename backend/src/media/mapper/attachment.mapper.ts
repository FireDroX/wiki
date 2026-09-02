import { ResponseDto } from '../../common/dto/response.dto.js';
import { AttachmentResponseDto } from '../dto/out/attachment-response.dto.js';
import { PresignedUrlResponseDto } from '../dto/out/presigned-url-response.dto.js';
import { Attachment } from '../entities/attachment.entity.js';

export class AttachmentMapper {
  static toAttachmentResponseDto(
    attachment: Attachment,
    url: string,
  ): AttachmentResponseDto {
    return {
      id: attachment.id,
      url,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
      size: attachment.size,
    };
  }

  static toResponse(
    attachment: Attachment,
    url: string,
  ): ResponseDto<AttachmentResponseDto> {
    return new ResponseDto(
      AttachmentMapper.toAttachmentResponseDto(attachment, url),
    );
  }

  static toListResponse(
    results: { attachment: Attachment; url: string }[],
  ): ResponseDto<AttachmentResponseDto[]> {
    return new ResponseDto(
      results.map(({ attachment, url }) =>
        AttachmentMapper.toAttachmentResponseDto(attachment, url),
      ),
    );
  }

  static toPresignedUrlResponse(
    url: string,
    expiresIn: number,
  ): ResponseDto<PresignedUrlResponseDto> {
    return new ResponseDto({ url, expiresIn });
  }
}
