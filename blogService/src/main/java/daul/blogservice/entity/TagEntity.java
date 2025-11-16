package daul.blogservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;

@Entity
@Table(name = "tags")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TagEntity {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long tagId;

  @Column(nullable = false, unique = true, length = 50)
  private String tagName;
}