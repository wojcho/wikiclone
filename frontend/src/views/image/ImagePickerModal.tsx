import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardActionArea,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";

import { listImagesImagesGet } from "../../client/sdk.gen";
import type { ImageRead } from "../../client/types.gen";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (image: ImageRead) => void;
};

export default function ImagePickerModal({
  open,
  onClose,
  onSelect,
}: Props) {
  const [images, setImages] = useState<ImageRead[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoading(true);

      try {
        const res = await listImagesImagesGet({
          throwOnError: true,
        });

        const data = (res as any)?.data ?? res;
        setImages(data);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Select image</DialogTitle>

      <DialogContent>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Grid container spacing={2}>
            {images.map((img) => {
              const url = `http://localhost:8000/images/${img.id}/raw`;

              return (
                <Grid item xs={6} sm={4} md={3} key={img.id}>
                  <Card>
                    <CardActionArea
                      onClick={() => {
                        onSelect(img);
                        onClose();
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="120"
                        image={url}
                        alt={img.display_name}
                      />

                      <Box sx={{ p: 1 }}>
                        <Typography variant="body2" noWrap>
                          {img.display_name}
                        </Typography>
                      </Box>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );
}
