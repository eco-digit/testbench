package de.ecodigit.yusuf.notification.application;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

  private JavaMailSender javaMailSender;

  @Value("${spring.mail.username}")
  private String fromEmailId;

  public void sendEmail(String recipient, String body, String subject) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromEmailId);
    message.setTo(recipient);
    message.setText(body);
    message.setSubject(subject);

    javaMailSender.send(message);
  }
}
