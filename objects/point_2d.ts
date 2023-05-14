export default class Point2D {

    private point_x: number = 0;
    private point_y: number = 0;

    constructor(point_x: number, point_y: number) {
        this.point_set(point_x, point_y);
    }

    public point_distance(point_destination: Point2D): number {
        return Math.sqrt(Math.pow((point_destination.point_get_x() - this.point_x), 2) + Math.pow((point_destination.point_get_y() - this.point_y), 2));
    }

    public point_set(point_x: number | null, point_y: number | null): Point2D {
        if (point_x !== null) this.point_x = point_x;
        if (point_y !== null) this.point_y = point_y;
        return this;
    }

    public point_offset(offset_x: number, offset_y: number): Point2D {
        this.point_x += offset_x;
        this.point_y += offset_y;
        return this;
    }

    public point_get_x(): number {
        return this.point_x;
    }

    public point_get_y(): number {
        return this.point_y;
    }

    public point_duplicate(): Point2D {
        return new Point2D(this.point_get_x(), this.point_get_y());
    }

}