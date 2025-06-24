export function getFileExtension(filename: string) {
    return filename.substring(filename.lastIndexOf(".") + 1);
  }