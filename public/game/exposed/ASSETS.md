# Exposed environment assets

These files are downloaded copies used locally by the game. Playing does not contact Poly Haven or its API.

## Sources and license

PBR textures and HDRI: [Poly Haven](https://polyhaven.com/), licensed [CC0](https://polyhaven.com/license). Files were selected using the public API with the User-Agent `Fed3AssetPreparation/1.0`. No live API is embedded in the game.

| Asset | Purpose | Original asset |
| --- | --- | --- |
| Asphalt 02 | Street surface: diffuse, OpenGL normal, roughness | https://polyhaven.com/a/asphalt_02 |
| Brick Wall 001 | Building walls: diffuse, OpenGL normal, roughness | https://polyhaven.com/a/brick_wall_001 |
| Concrete Floor Worn 001 | Pavement and concrete: diffuse, OpenGL normal, roughness | https://polyhaven.com/a/concrete_floor_worn_001 |
| Industrial Sunset 02 | Optional environment lighting, 1k Radiance HDR | https://polyhaven.com/a/industrial_sunset_02 |

All image files are 1k JPG maps, except the HDR environment. Diffuse textures use sRGB; normal and roughness maps use linear data. Normal maps use OpenGL (+Y), suitable for Three.js.

## Original download URLs

- `asphalt_02_diff_1k.jpg` (731707 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_02/asphalt_02_diff_1k.jpg
- `asphalt_02_nor_gl_1k.jpg` (1240122 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_02/asphalt_02_nor_gl_1k.jpg
- `asphalt_02_rough_1k.jpg` (544032 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/asphalt_02/asphalt_02_rough_1k.jpg
- `brick_wall_001_diffuse_1k.jpg` (574381 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brick_wall_001/brick_wall_001_diffuse_1k.jpg
- `brick_wall_001_nor_gl_1k.jpg` (295279 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brick_wall_001/brick_wall_001_nor_gl_1k.jpg
- `brick_wall_001_rough_1k.jpg` (211093 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/brick_wall_001/brick_wall_001_rough_1k.jpg
- `concrete_floor_worn_001_diff_1k.jpg` (118806 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_worn_001/concrete_floor_worn_001_diff_1k.jpg
- `concrete_floor_worn_001_nor_gl_1k.jpg` (110906 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_worn_001/concrete_floor_worn_001_nor_gl_1k.jpg
- `concrete_floor_worn_001_rough_1k.jpg` (181942 bytes): https://dl.polyhaven.org/file/ph-assets/Textures/jpg/1k/concrete_floor_worn_001/concrete_floor_worn_001_rough_1k.jpg
- `industrial_sunset_02_1k.hdr` (1610744 bytes): https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/industrial_sunset_02_1k.hdr

Each downloaded file was checked against the MD5 supplied in its Poly Haven API response. Total: 5619012 bytes.
